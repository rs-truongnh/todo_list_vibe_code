const swaggerJSDoc = require('swagger-jsdoc');
require('dotenv').config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo List API',
      version: '1.0.0',
      description: 'Một REST API đầy đủ cho ứng dụng Todo List được xây dựng với Node.js, Express và MongoDB',
      contact: {
        name: 'API Support',
        email: 'support@todoapi.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' ? 'https://your-production-url.com' : `http://localhost:${process.env.PORT || 8888}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      schemas: {
        Todo: {
          type: 'object',
          required: ['title', 'startTime', 'endTime'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID tự động tạo của MongoDB'
            },
            user: {
              type: 'object',
              description: 'Thông tin người được giao việc',
              properties: {
                _id: { type: 'string' },
                fullName: { type: 'string' },
                email: { type: 'string' }
              }
            },
            createdBy: {
              type: 'object',
              description: 'Thông tin người tạo todo',
              properties: {
                _id: { type: 'string' },
                fullName: { type: 'string' },
                email: { type: 'string' }
              }
            },
            assignedTo: {
              type: 'object',
              description: 'Thông tin người được giao việc',
              properties: {
                _id: { type: 'string' },
                fullName: { type: 'string' },
                email: { type: 'string' }
              }
            },
            title: {
              type: 'string',
              maxLength: 200,
              description: 'Tiêu đề công việc',
              example: 'Hoàn thành dự án Todo API'
            },
            description: {
              type: 'string',
              maxLength: 1000,
              description: 'Mô tả chi tiết công việc',
              example: 'Viết code backend API và tạo documentation với Swagger'
            },
            startTime: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian bắt đầu công việc',
              example: '2024-10-02T09:00:00.000Z'
            },
            endTime: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian kết thúc công việc',
              example: '2024-10-02T17:00:00.000Z'
            },
            status: {
              type: 'string',
              enum: ['pending', 'in-progress', 'completed', 'cancelled'],
              default: 'pending',
              description: 'Trạng thái công việc',
              example: 'pending'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              default: 'medium',
              description: 'Độ ưu tiên',
              example: 'high'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Các tags để phân loại',
              example: ['work', 'urgent', 'api']
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian tạo (tự động)',
              example: '2024-10-02T08:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian cập nhật (tự động)',
              example: '2024-10-02T08:30:00.000Z'
            },
            duration: {
              type: 'number',
              description: 'Thời gian làm việc (giờ) - Virtual field',
              example: 8
            }
          }
        },
        CreateTodoRequest: {
          type: 'object',
          required: ['title', 'startTime', 'endTime'],
          properties: {
            title: {
              type: 'string',
              maxLength: 200,
              description: 'Tiêu đề công việc',
              example: 'Hoàn thành dự án Todo API'
            },
            description: {
              type: 'string',
              maxLength: 1000,
              description: 'Mô tả chi tiết công việc',
              example: 'Viết code backend API và tạo documentation với Swagger'
            },
            startTime: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian bắt đầu công việc',
              example: '2024-10-02T09:00:00.000Z'
            },
            endTime: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian kết thúc công việc',
              example: '2024-10-02T17:00:00.000Z'
            },
            status: {
              type: 'string',
              enum: ['pending', 'in-progress', 'completed', 'cancelled'],
              description: 'Trạng thái công việc',
              example: 'pending'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Độ ưu tiên',
              example: 'high'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Các tags để phân loại',
              example: ['work', 'urgent']
            },
            assignedTo: {
              type: 'string',
              description: 'ID của user được giao việc (optional - mặc định là người tạo)',
              example: '507f1f77bcf86cd799439011'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Thao tác thành công'
            },
            data: {
              type: 'object'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Có lỗi xảy ra'
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Field validation failed']
            }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            count: {
              type: 'number',
              description: 'Số lượng items trong page hiện tại',
              example: 10
            },
            total: {
              type: 'number',
              description: 'Tổng số items',
              example: 50
            },
            currentPage: {
              type: 'number',
              description: 'Trang hiện tại',
              example: 1
            },
            totalPages: {
              type: 'number',
              description: 'Tổng số trang',
              example: 5
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Todo'
              }
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
              example: '507f1f77bcf86cd799439011'
            },
            username: {
              type: 'string',
              description: 'Username',
              example: 'john_doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address',
              example: 'john@example.com'
            },
            fullName: {
              type: 'string',
              description: 'Full name',
              example: 'John Doe'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role',
              example: 'user'
            },
            isActive: {
              type: 'boolean',
              description: 'Account status',
              example: true
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp',
              example: '2024-10-02T10:00:00.000Z'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
              example: '2024-10-01T08:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2024-10-02T09:00:00.000Z'
            }
          }
        },
        TokenResponse: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              description: 'JWT access token',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            refreshToken: {
              type: 'string',
              description: 'JWT refresh token',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            expiresIn: {
              type: 'string',
              description: 'Access token expiration time',
              example: '15m'
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Nhập JWT token để xác thực'
        }
      },
      parameters: {
        todoId: {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID của Todo',
          schema: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          }
        },
        status: {
          name: 'status',
          in: 'path',
          required: true,
          description: 'Trạng thái Todo',
          schema: {
            type: 'string',
            enum: ['pending', 'in-progress', 'completed', 'cancelled']
          }
        },
        page: {
          name: 'page',
          in: 'query',
          description: 'Số trang',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          }
        },
        limit: {
          name: 'limit',
          in: 'query',
          description: 'Số lượng items per page',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          }
        },
        sortBy: {
          name: 'sortBy',
          in: 'query',
          description: 'Field để sắp xếp',
          schema: {
            type: 'string',
            enum: ['createdAt', 'updatedAt', 'startTime', 'endTime', 'title', 'priority'],
            default: 'createdAt'
          }
        },
        sortOrder: {
          name: 'sortOrder',
          in: 'query',
          description: 'Thứ tự sắp xếp',
          schema: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'desc'
          }
        },
        statusFilter: {
          name: 'status',
          in: 'query',
          description: 'Lọc theo trạng thái',
          schema: {
            type: 'string',
            enum: ['pending', 'in-progress', 'completed', 'cancelled']
          }
        },
        priorityFilter: {
          name: 'priority',
          in: 'query',
          description: 'Lọc theo độ ưu tiên',
          schema: {
            type: 'string',
            enum: ['low', 'medium', 'high']
          }
        },
        startDate: {
          name: 'startDate',
          in: 'query',
          description: 'Ngày bắt đầu (YYYY-MM-DD)',
          schema: {
            type: 'string',
            format: 'date',
            example: '2024-10-01'
          }
        },
        endDate: {
          name: 'endDate',
          in: 'query',
          description: 'Ngày kết thúc (YYYY-MM-DD)',
          schema: {
            type: 'string',
            format: 'date',
            example: '2024-10-31'
          }
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints'
      },
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Todos',
        description: 'Todo management endpoints (requires authentication)'
      },
      {
        name: 'Special Queries',
        description: 'Advanced query endpoints (requires authentication)'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './server.js'
  ]
};

const specs = swaggerJSDoc(options);

module.exports = specs;
