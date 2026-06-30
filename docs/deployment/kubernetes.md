# Kubernetes Deployment Guide

## Prerequisites

- kubectl v1.28+
- Helm v3+
- eksctl or AWS CLI configured
- Access to EKS cluster

## Cluster Setup

### Connect to Cluster
```bash
aws eks update-kubeconfig --region ap-south-1 --name it-connect-matrimony-prod-cluster
kubectl get nodes
```

### Namespace
All resources are deployed to the `it-connect` namespace:
```yaml
# infrastructure/kubernetes/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: it-connect
```

## Deploying Services

### Backend
```bash
kubectl apply -f infrastructure/kubernetes/namespace.yaml
kubectl apply -f infrastructure/kubernetes/backend/configmap.yaml
kubectl apply -f infrastructure/kubernetes/backend/deployment.yaml
kubectl apply -f infrastructure/kubernetes/backend/service.yaml
kubectl apply -f infrastructure/kubernetes/backend/hpa.yaml
```

### Web (Next.js)
```bash
kubectl apply -f infrastructure/kubernetes/web/deployment.yaml
kubectl apply -f infrastructure/kubernetes/web/service.yaml
kubectl apply -f infrastructure/kubernetes/web/hpa.yaml
```

### Admin Panel
```bash
kubectl apply -f infrastructure/kubernetes/admin/deployment.yaml
kubectl apply -f infrastructure/kubernetes/admin/service.yaml
```

### MySQL
```bash
kubectl apply -f infrastructure/kubernetes/mysql/statefulset.yaml
kubectl apply -f infrastructure/kubernetes/mysql/service.yaml
```

### Redis
```bash
kubectl apply -f infrastructure/kubernetes/redis/deployment.yaml
kubectl apply -f infrastructure/kubernetes/redis/service.yaml
```

### Elasticsearch
```bash
kubectl apply -f infrastructure/kubernetes/elasticsearch/statefulset.yaml
kubectl apply -f infrastructure/kubernetes/elasticsearch/service.yaml
```

### RabbitMQ
```bash
kubectl apply -f infrastructure/kubernetes/rabbitmq/deployment.yaml
kubectl apply -f infrastructure/kubernetes/rabbitmq/service.yaml
```

### Ingress
```bash
kubectl apply -f infrastructure/kubernetes/ingress/ingress.yaml
kubectl apply -f infrastructure/kubernetes/ingress/ssl-config.yaml
```

### Monitoring (Prometheus + Grafana)
```bash
kubectl apply -f infrastructure/kubernetes/monitoring/prometheus-deployment.yaml
kubectl apply -f infrastructure/kubernetes/monitoring/grafana-deployment.yaml
kubectl apply -f infrastructure/kubernetes/monitoring/grafana-service.yaml
```

## Backend Deployment Configuration

### Deployment (`backend/deployment.yaml`)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: it-connect
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - backend
              topologyKey: topology.kubernetes.io/zone
      containers:
      - name: backend
        image: $ECR_REGISTRY/backend:latest
        ports:
        - containerPort: 4000
          name: http
        envFrom:
        - configMapRef:
            name: backend-config
        resources:
          requests:
            cpu: 500m
            memory: 1Gi
          limits:
            cpu: 2000m
            memory: 2Gi
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 15
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 4000
          initialDelaySeconds: 15
          periodSeconds: 10
          timeoutSeconds: 3
          successThreshold: 1
          failureThreshold: 3
        startupProbe:
          httpGet:
            path: /api/v1/health
            port: 4000
          initialDelaySeconds: 10
          periodSeconds: 5
          failureThreshold: 30
```

### Horizontal Pod Autoscaler (`backend/hpa.yaml`)
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: it-connect
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### ConfigMap (`backend/configmap.yaml`)
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
  namespace: it-connect
data:
  NODE_ENV: "production"
  PORT: "4000"
  API_PREFIX: "api/v1"
  DB_HOST: "mysql-service"
  DB_PORT: "3306"
  DB_DATABASE: "it_connect"
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"
  ELASTICSEARCH_HOST: "http://elasticsearch-service:9200"
  CORS_ORIGINS: "https://itconnectmatrimony.com,https://www.itconnectmatrimony.com,https://admin.itconnectmatrimony.com"
  LOG_LEVEL: "info"
  AWS_REGION: "ap-south-1"
```

### Ingress (`ingress.yaml`)
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: main-ingress
  namespace: it-connect
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
    nginx.ingress.kubernetes.io/enable-cors: "true"
spec:
  tls:
  - hosts:
    - api.itconnectmatrimony.com
    secretName: it-connect-tls
  rules:
  - host: api.itconnectmatrimony.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 4000
  - host: www.itconnectmatrimony.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 3000
  - host: admin.itconnectmatrimony.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: admin-service
            port:
              number: 3000
```

## Common Operations

### Rolling Update
```bash
# Update with new image
kubectl set image deployment/backend backend=$ECR_REGISTRY/backend:new-tag -n it-connect

# Check rollout status
kubectl rollout status deployment/backend -n it-connect

# Rollback if needed
kubectl rollout undo deployment/backend -n it-connect
```

### Scaling
```bash
# Manual scale
kubectl scale deployment/backend --replicas=5 -n it-connect

# Check HPA status
kubectl get hpa -n it-connect
```

### Logs
```bash
# Pod logs
kubectl logs -f deployment/backend -n it-connect

# Previous instance logs (after crash)
kubectl logs deployment/backend -n it-connect --previous
```

### Debugging
```bash
# Get pod status
kubectl get pods -n it-connect -o wide

# Describe pod for errors
kubectl describe pod backend-xxx -n it-connect

# Exec into pod
kubectl exec -it deployment/backend -n it-connect -- sh

# Port-forward for local access
kubectl port-forward service/backend-service 4000:4000 -n it-connect
```

### Secrets Management
```bash
# Create secret from file
kubectl create secret generic it-connect-secrets \
  --from-file=.env.production \
  -n it-connect

# Or create individual secrets
kubectl create secret generic jwt-secret \
  --from-literal=JWT_SECRET=$(openssl rand -base64 32) \
  -n it-connect
```
