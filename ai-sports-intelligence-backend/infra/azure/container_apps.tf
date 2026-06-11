resource "azurerm_container_app_environment" "main" {
  name                       = "${local.name_prefix}-cae"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  infrastructure_subnet_id = azurerm_subnet.container_apps.id
}

resource "azurerm_user_assigned_identity" "app" {
  name                = "${local.name_prefix}-identity"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_role_assignment" "app_kv_secrets" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.app.principal_id
}

resource "azurerm_role_assignment" "app_blob" {
  scope                = azurerm_storage_account.main.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_user_assigned_identity.app.principal_id
}

locals {
  common_env = [
    { name = "ENVIRONMENT", value = var.environment },
    { name = "OBJECT_STORAGE_PROVIDER", value = "azure_blob" },
    { name = "AZURE_BLOB_CONTAINER", value = azurerm_storage_container.main.name },
    { name = "SECRETS_PROVIDER", value = "azure_key_vault" },
    { name = "AZURE_KEY_VAULT_URL", value = azurerm_key_vault.main.vault_uri },
  ]

  common_secrets = [
    {
      name                = "database-url"
      key_vault_secret_id = azurerm_key_vault_secret.database_url.id
    },
    {
      name                = "redis-url"
      key_vault_secret_id = azurerm_key_vault_secret.redis_url.id
    },
    {
      name                = "secret-key"
      key_vault_secret_id = azurerm_key_vault_secret.secret_key.id
    },
    {
      name                = "storage-connection-string"
      key_vault_secret_id = azurerm_key_vault_secret.storage_connection_string.id
    },
  ]
}

resource "azurerm_key_vault_secret" "storage_connection_string" {
  name         = "AZURE-STORAGE-CONNECTION-STRING"
  key_vault_id = azurerm_key_vault.main.id
  value        = azurerm_storage_account.main.primary_connection_string

  depends_on = [azurerm_role_assignment.deployer_kv_admin]
}

resource "azurerm_container_app" "api" {
  name                         = "${local.name_prefix}-api"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.app.id]
  }

  dynamic "secret" {
    for_each = local.common_secrets
    content {
      name                = secret.value.name
      key_vault_secret_id = secret.value.key_vault_secret_id
      identity            = azurerm_user_assigned_identity.app.id
    }
  }

  ingress {
    external_enabled = true
    target_port      = 8000

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    min_replicas = 1
    max_replicas = var.desired_replicas * 2

    container {
      name   = "api"
      image  = var.container_image
      cpu    = 0.5
      memory = "1Gi"

      dynamic "env" {
        for_each = local.common_env
        content {
          name  = env.value.name
          value = env.value.value
        }
      }

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }
      env {
        name        = "REDIS_URL"
        secret_name = "redis-url"
      }
      env {
        name        = "SECRET_KEY"
        secret_name = "secret-key"
      }
      env {
        name        = "AZURE_STORAGE_CONNECTION_STRING"
        secret_name = "storage-connection-string"
      }

      liveness_probe {
        transport = "HTTP"
        port      = 8000
        path      = "/api/v1/health/live"
      }

      readiness_probe {
        transport = "HTTP"
        port      = 8000
        path      = "/api/v1/health/ready"
      }
    }

    http_scale_rule {
      name                = "http-scaling"
      concurrent_requests = 50
    }
  }
}

resource "azurerm_container_app" "worker" {
  name                         = "${local.name_prefix}-worker"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.app.id]
  }

  dynamic "secret" {
    for_each = local.common_secrets
    content {
      name                = secret.value.name
      key_vault_secret_id = secret.value.key_vault_secret_id
      identity            = azurerm_user_assigned_identity.app.id
    }
  }

  template {
    min_replicas = 1
    max_replicas = 2

    container {
      name    = "worker"
      image   = var.container_image
      cpu     = 0.5
      memory  = "1Gi"
      command = ["celery", "-A", "app.jobs.celery_app:celery_app", "worker", "--loglevel=INFO"]

      dynamic "env" {
        for_each = local.common_env
        content {
          name  = env.value.name
          value = env.value.value
        }
      }

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }
      env {
        name        = "REDIS_URL"
        secret_name = "redis-url"
      }
      env {
        name        = "SECRET_KEY"
        secret_name = "secret-key"
      }
      env {
        name        = "AZURE_STORAGE_CONNECTION_STRING"
        secret_name = "storage-connection-string"
      }
    }
  }
}

resource "azurerm_container_app" "beat" {
  name                         = "${local.name_prefix}-beat"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.app.id]
  }

  dynamic "secret" {
    for_each = local.common_secrets
    content {
      name                = secret.value.name
      key_vault_secret_id = secret.value.key_vault_secret_id
      identity            = azurerm_user_assigned_identity.app.id
    }
  }

  template {
    min_replicas = 1
    max_replicas = 1

    container {
      name    = "beat"
      image   = var.container_image
      cpu     = 0.25
      memory  = "0.5Gi"
      command = ["celery", "-A", "app.jobs.celery_app:celery_app", "beat", "--loglevel=INFO"]

      dynamic "env" {
        for_each = local.common_env
        content {
          name  = env.value.name
          value = env.value.value
        }
      }

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }
      env {
        name        = "REDIS_URL"
        secret_name = "redis-url"
      }
      env {
        name        = "SECRET_KEY"
        secret_name = "secret-key"
      }
    }
  }
}
