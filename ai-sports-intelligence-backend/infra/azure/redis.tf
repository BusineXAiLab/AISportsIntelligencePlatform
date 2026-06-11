resource "azurerm_redis_cache" "main" {
  name                = "${local.name_prefix}-redis"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  capacity = var.redis_capacity
  family   = var.redis_family
  sku_name = var.redis_sku

  minimum_tls_version = "1.2"

  redis_configuration {
  }
}

locals {
  redis_url = "rediss://:${azurerm_redis_cache.main.primary_access_key}@${azurerm_redis_cache.main.hostname}:6380/0"
}
