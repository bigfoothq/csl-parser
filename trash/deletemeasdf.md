
```
│¦║
* Microservice Configuration
web_service {
    service_name :user_authentication
    * Deployment environments
    environments [
        -{
            name :production
            replicas :3
            resources {
                cpu :4
                memory :16Gi
            }
        }
        -{
            name :staging
            replicas :2
            resources {
                cpu :2
                memory :8Gi
            }
        }
    ]
    * Endpoint configurations
    endpoints {
        login {
            path :/auth/login
            method :POST
            rate_limit :100
        }
        logout {
            path :/auth/logout
            method :POST
            rate_limit :50
        }
    }
    * Logging configuration
    logging {
        level :INFO
        output_paths [:stdout, :/var/log/service.log]
        * Ignored paths for logging
        ignore_paths [:/health, :/, :, :null]
    }
}
```