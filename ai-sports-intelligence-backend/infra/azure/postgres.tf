resource "random_password" "postgres" {
  length  = 32
  special = false
}

resource "azurerm_postgresql_flexible_server" "main" {
  name                = "${local.name_prefix}-postgres"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  version                = "16"
  administrator_login    = var.postgres_admin_username
  administrator_password = random_password.postgres.result

  sku_name   = var.postgres_sku
  storage_mb = 32768

  backup_retention_days        = 7
  geo_redundant_backup_enabled = var.environment == "production"

  zone = "1"
}

resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "sports_ai"
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# Container Apps egress to PostgreSQL; restrict to Azure services + VNet.
resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}
