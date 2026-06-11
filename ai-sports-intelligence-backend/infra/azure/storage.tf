resource "azurerm_storage_account" "main" {
  name                     = substr("${local.name_compact}store", 0, 24)
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = var.environment == "production" ? "GRS" : "LRS"

  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false

  blob_properties {
    versioning_enabled = true

    delete_retention_policy {
      days = 30
    }
  }
}

resource "azurerm_storage_container" "main" {
  name                  = "platform-objects"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}
