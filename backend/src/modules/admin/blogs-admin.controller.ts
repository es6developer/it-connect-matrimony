import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { Blog } from '../../database/entities/blog.entity';
import { User } from '../../database/entities/user.entity';
import { BlogQueryDto } from './dto/blog-query.dto';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog-crud.dto';
import { ERROR_CODES } from '../../common/constants';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces';

@ApiTags('Admin - Blogs')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/blogs')
export class BlogsAdminController {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all blog posts' })
  @ApiResponse({ status: 200, description: 'Blogs retrieved' })
  async listBlogs(@Query() query: BlogQueryDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', status, category, search } = query;
    const skip = (page - 1) * limit;

    const qb = this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.author', 'author');

    if (status) qb.andWhere('blog.status = :status', { status });
    if (category) qb.andWhere('blog.category = :category', { category });
    if (search) qb.andWhere('blog.title LIKE :search', { search: `%${search}%` });

    const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'status', 'publishedAt', 'viewCount'];
    const orderField = allowedSortFields.includes(sortBy) ? `blog.${sortBy}` : 'blog.createdAt';

    qb.orderBy(orderField, sortOrder).skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: 'Blogs retrieved successfully',
      data,
      meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a blog post by UUID' })
  @ApiResponse({ status: 200, description: 'Blog retrieved' })
  async getBlog(@Param('id') id: string) {
    const blog = await this.blogRepository.findOne({
      where: { uuid: id },
      relations: ['author'],
    });

    if (!blog) {
      throw new NotFoundException({
        success: false,
        message: 'Blog not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    return {
      success: true,
      message: 'Blog retrieved successfully',
      data: blog,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiResponse({ status: 201, description: 'Blog created' })
  async createBlog(@Body() dto: CreateBlogDto, @CurrentUser() admin: JwtPayload) {
    const existingSlug = await this.blogRepository.findOne({ where: { slug: dto.slug } });

    if (existingSlug) {
      throw new ConflictException({
        success: false,
        message: 'A blog with this slug already exists',
        error: ERROR_CODES.DUPLICATE_ENTRY,
        statusCode: 409,
      });
    }

    const adminUser = await this.userRepository.findOne({ where: { uuid: admin.sub } });

    const blog = this.blogRepository.create({
      uuid: uuidv4(),
      authorId: adminUser?.id,
      title: dto.title,
      slug: dto.slug,
      content: dto.content,
      excerpt: dto.excerpt || null,
      coverImage: dto.coverImage || null,
      tags: dto.tags || null,
      category: dto.category || null,
      status: 'draft',
    });

    await this.blogRepository.save(blog);

    return {
      success: true,
      message: 'Blog post created successfully',
      data: blog,
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a blog post' })
  @ApiResponse({ status: 200, description: 'Blog updated' })
  async updateBlog(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    const blog = await this.blogRepository.findOne({ where: { uuid: id } });

    if (!blog) {
      throw new NotFoundException({
        success: false,
        message: 'Blog not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    if (dto.slug && dto.slug !== blog.slug) {
      const existingSlug = await this.blogRepository.findOne({ where: { slug: dto.slug } });
      if (existingSlug) {
        throw new ConflictException({
          success: false,
          message: 'A blog with this slug already exists',
          error: ERROR_CODES.DUPLICATE_ENTRY,
          statusCode: 409,
        });
      }
    }

    if (dto.title !== undefined) blog.title = dto.title;
    if (dto.slug !== undefined) blog.slug = dto.slug;
    if (dto.content !== undefined) blog.content = dto.content;
    if (dto.excerpt !== undefined) blog.excerpt = dto.excerpt;
    if (dto.coverImage !== undefined) blog.coverImage = dto.coverImage;
    if (dto.tags !== undefined) blog.tags = dto.tags;
    if (dto.category !== undefined) blog.category = dto.category;

    await this.blogRepository.save(blog);

    return {
      success: true,
      message: 'Blog updated successfully',
      data: blog,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a blog post' })
  @ApiResponse({ status: 200, description: 'Blog deleted' })
  async deleteBlog(@Param('id') id: string) {
    const blog = await this.blogRepository.findOne({ where: { uuid: id } });

    if (!blog) {
      throw new NotFoundException({
        success: false,
        message: 'Blog not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    await this.blogRepository.remove(blog);

    return {
      success: true,
      message: 'Blog deleted successfully',
    };
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish a blog post' })
  @ApiResponse({ status: 200, description: 'Blog published' })
  async publishBlog(@Param('id') id: string) {
    const blog = await this.blogRepository.findOne({ where: { uuid: id } });

    if (!blog) {
      throw new NotFoundException({
        success: false,
        message: 'Blog not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    blog.status = 'published';
    blog.publishedAt = new Date();
    await this.blogRepository.save(blog);

    return {
      success: true,
      message: 'Blog published successfully',
    };
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive a blog post' })
  @ApiResponse({ status: 200, description: 'Blog archived' })
  async archiveBlog(@Param('id') id: string) {
    const blog = await this.blogRepository.findOne({ where: { uuid: id } });

    if (!blog) {
      throw new NotFoundException({
        success: false,
        message: 'Blog not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    blog.status = 'archived';
    await this.blogRepository.save(blog);

    return {
      success: true,
      message: 'Blog archived successfully',
    };
  }
}
