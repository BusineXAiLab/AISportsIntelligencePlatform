data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "main" {
  name                = substr("${local.name_compact}kv", 0, 24)
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tenant_id           = data.azurerm_client_config.current.tenant_id

  sku_name                  = "standard"
  enable_rbac_authorization = true
  purge_protection_enabled  = var.environment == "production"
}

resource "azurerm_role_assignment" "deployer_kv_admin" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Administrator"
  principal_id         = data.azurerm_client_config.current.object_id
}

resource "random_password" "app_secret_key" {
  length  = 64
  special = false
}

resource "azurerm_key_vault_secret" "database_url" {
  name         = "DATABASE-URL"
  key_vault_id = azurerm_key_vault.main.id
  value        = "postgresql+asyncpg://${var.postgres_admin_username}:${random_password.postgres.result}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/sports_ai"

  depends_on = [azurerm_role_assignment.deployer_kv_admin]
}

resource "azurerm_key_vault_secret" "redis_url" {
  name         = "REDIS-URL"
  key_vault_id = azurerm_key_vault.main.id
  value        = local.redis_url

  depends_on = [azurerm_role_assignment.deployer_kv_admin]
}

resource "azurerm_key_vault_secret" "secret_key" {
  name         = "SECRET-KEY"
  key_vault_id = azurerm_key_vault.main.id
  value        = random_password.app_secret_key.result

  depends_on = [azurerm_role_assignment.deployer_kv_admin]
}
