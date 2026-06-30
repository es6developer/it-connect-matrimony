#!/usr/bin/env bash
set -euo pipefail

# ============================================
# IT Connect Matrimony - Blue/Green Deploy Script
# ============================================

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC}  $*"; }
log_success() { echo -e "${GREEN}[OK]${NC}   $*"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }

# Default values
NAMESPACE="${NAMESPACE:-it-connect}"
DEPLOYMENT_NAME="${DEPLOYMENT_NAME:-}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
ROLLBACK="${ROLLBACK:-false}"
DRY_RUN="${DRY_RUN:-false}"
TIMEOUT="${TIMEOUT:-300}"
REPLICA_GREEN="${REPLICA_GREEN:-3}"
HEALTH_CHECK_RETRIES="${HEALTH_CHECK_RETRIES:-30}"
HEALTH_CHECK_INTERVAL="${HEALTH_CHECK_INTERVAL:-10}"

usage() {
    cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Blue-Green deployment for IT Connect Matrimony services.

Options:
    -n, --namespace NAME     Kubernetes namespace (default: it-connect)
    -d, --deployment NAME    Deployment name (backend, web, admin)
    -t, --tag TAG            Docker image tag (default: latest)
    -r, --rollback           Rollback to previous version
    --dry-run               Show what would be done without making changes
    --timeout SECONDS        Timeout for operations (default: 300)
    -h, --help              Show this help message

Examples:
    $(basename "$0") -d backend -t v1.2.3
    $(basename "$0") -d web -t v1.2.3 --dry-run
    $(basename "$0") -d backend -r
EOF
    exit 0
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -n|--namespace)     NAMESPACE="$2"; shift 2 ;;
            -d|--deployment)    DEPLOYMENT_NAME="$2"; shift 2 ;;
            -t|--tag)           IMAGE_TAG="$2"; shift 2 ;;
            -r|--rollback)      ROLLBACK=true; shift ;;
            --dry-run)          DRY_RUN=true; shift ;;
            --timeout)          TIMEOUT="$2"; shift 2 ;;
            -h|--help)          usage ;;
            *)                  log_error "Unknown option: $1"; usage ;;
        esac
    done

    if [[ -z "${DEPLOYMENT_NAME}" ]]; then
        log_error "Deployment name is required. Use -d or --deployment"
        usage
    fi
}

check_prerequisites() {
    local missing=0
    for cmd in kubectl docker aws; do
        if ! command -v "$cmd" &>/dev/null; then
            log_error "Required command not found: $cmd"
            missing=1
        fi
    done
    if [[ $missing -eq 1 ]]; then
        exit 1
    fi
    if ! kubectl get namespace "${NAMESPACE}" &>/dev/null; then
        log_error "Namespace '${NAMESPACE}' does not exist"
        exit 1
    fi
    log_success "All prerequisites met"
}

get_image_for_deployment() {
    local deployment="$1"
    local tag="$2"

    case "${deployment}" in
        backend) echo "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/it-connect-backend:${tag}" ;;
        web)     echo "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/it-connect-web:${tag}" ;;
        admin)   echo "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/it-connect-admin:${tag}" ;;
        *)       log_error "Unknown deployment: ${deployment}"; exit 1 ;;
    esac
}

deploy_blue_green() {
    local deployment="$1"
    local tag="$2"
    local namespace="$3"
    local image

    image=$(get_image_for_deployment "${deployment}" "${tag}")
    log_info "Deploying ${deployment} with image: ${image}"

    # Determine active and new colors
    local active_color=""
    local new_color=""

    if kubectl get service "${deployment}-green" -n "${namespace}" &>/dev/null 2>&1; then
        active_color="green"
        new_color="blue"
    else
        active_color="blue"
        new_color="green"
    fi

    log_info "Active: ${active_color} | New: ${new_color}"

    # Create or update the new deployment
    local new_deployment="${deployment}-${new_color}"
    local active_deployment="${deployment}-${active_color}"

    if [[ "${DRY_RUN}" == "true" ]]; then
        log_info "[DRY-RUN] Would create deployment ${new_deployment} with image ${image}"
        log_info "[DRY-RUN] Would wait for rollout of ${new_deployment}"
        log_info "[DRY-RUN] Would run health checks on ${new_deployment}"
        log_info "[DRY-RUN] Would switch service to ${new_color}"
        log_info "[DRY-RUN] Would scale down ${active_deployment}"
        return 0
    fi

    # Scale the new deployment
    log_info "Scaling up ${new_deployment}..."
    kubectl scale deployment "${new_deployment}" --replicas="${REPLICA_GREEN}" -n "${namespace}" 2>/dev/null || \
        kubectl create deployment "${new_deployment}" --image="${image}" -n "${namespace}" --replicas="${REPLICA_GREEN}"

    # Set the image
    kubectl set image deployment/"${new_deployment}" "*=${image}" -n "${namespace}"

    # Wait for rollout
    log_info "Waiting for rollout of ${new_deployment}..."
    if ! kubectl rollout status deployment/"${new_deployment}" -n "${namespace}" --timeout="${TIMEOUT}s"; then
        log_error "Rollout of ${new_deployment} failed"
        log_info "Initiating rollback to ${active_deployment}..."
        kubectl scale deployment "${new_deployment}" --replicas=0 -n "${namespace}"
        return 1
    fi
    log_success "Rollout of ${new_deployment} completed"

    # Health check
    log_info "Running health checks on ${new_deployment}..."
    local retries=0
    while [[ $retries -lt ${HEALTH_CHECK_RETRIES} ]]; do
        local pod
        pod=$(kubectl get pods -n "${namespace}" -l "app=${deployment},color=${new_color}" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)
        if [[ -n "${pod}" ]]; then
            local status
            status=$(kubectl get pod "${pod}" -n "${namespace}" -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>/dev/null || true)
            if [[ "${status}" == "True" ]]; then
                log_success "Health check passed"
                break
            fi
        fi
        retries=$((retries + 1))
        sleep "${HEALTH_CHECK_INTERVAL}"
    done

    if [[ $retries -eq ${HEALTH_CHECK_RETRIES} ]]; then
        log_error "Health check failed after ${HEALTH_CHECK_RETRIES} retries"
        log_info "Initiating rollback to ${active_deployment}..."
        kubectl scale deployment "${new_deployment}" --replicas=0 -n "${namespace}"
        return 1
    fi

    # Switch service to new color
    log_info "Switching service to ${new_color}..."
    kubectl patch service "${deployment}" -n "${namespace}" -p "{\"spec\":{\"selector\":{\"app\":\"${deployment}\",\"color\":\"${new_color}\"}}}"
    log_success "Service switched to ${new_color}"

    # Scale down old deployment
    log_info "Scaling down ${active_deployment}..."
    kubectl scale deployment "${active_deployment}" --replicas=0 -n "${namespace}"
    log_success "Scaled down ${active_deployment}"

    # Clean up old deployment after 1 hour (run in background)
    # kubectl delete deployment "${active_deployment}" -n "${namespace}" &

    log_success "${GREEN}Deployment of ${deployment} (${tag}) completed successfully${NC}"
    return 0
}

rollback_deployment() {
    local deployment="$1"
    local namespace="$2"

    log_info "Rolling back ${deployment}..."

    local blue_deployment="${deployment}-blue"
    local green_deployment="${deployment}-green"

    local active_color=""
    if kubectl get service "${deployment}" -n "${namespace}" -o jsonpath='{.spec.selector.color}' | grep -q "blue"; then
        active_color="blue"
    else
        active_color="green"
    fi

    local inactive_color
    if [[ "${active_color}" == "blue" ]]; then
        inactive_color="green"
    else
        inactive_color="blue"
    fi

    log_info "Current active: ${active_color}, switching to: ${inactive_color}"

    if [[ "${DRY_RUN}" == "true" ]]; then
        log_info "[DRY-RUN] Would switch service to ${inactive_color}"
        return 0
    fi

    # Verify inactive deployment exists and is healthy
    local inactive_deployment="${deployment}-${inactive_color}"
    if ! kubectl get deployment "${inactive_deployment}" -n "${namespace}" &>/dev/null; then
        log_error "Inactive deployment ${inactive_deployment} does not exist"
        return 1
    fi

    # Scale up inactive
    kubectl scale deployment "${inactive_deployment}" --replicas="${REPLICA_GREEN}" -n "${namespace}"

    # Wait for rollout
    if ! kubectl rollout status deployment/"${inactive_deployment}" -n "${namespace}" --timeout="${TIMEOUT}s"; then
        log_error "Rollback rollout failed"
        return 1
    fi

    # Switch service
    kubectl patch service "${deployment}" -n "${namespace}" -p "{\"spec\":{\"selector\":{\"color\":\"${inactive_color}\"}}}"
    log_success "Rollback to ${inactive_color} completed"

    # Scale down active
    kubectl scale deployment "${deployment}-${active_color}" --replicas=0 -n "${namespace}"

    return 0
}

main() {
    parse_args "$@"
    check_prerequisites

    if [[ "${ROLLBACK}" == "true" ]]; then
        rollback_deployment "${DEPLOYMENT_NAME}" "${NAMESPACE}"
    else
        deploy_blue_green "${DEPLOYMENT_NAME}" "${IMAGE_TAG}" "${NAMESPACE}"
    fi
}

main "$@"
