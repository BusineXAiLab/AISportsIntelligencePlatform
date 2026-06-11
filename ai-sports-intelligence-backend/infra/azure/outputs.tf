output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "api_fqdn" {
  description = "Direct FQDN of the API container app"
  value       = azurerm_container_app.api.latest_revision_fqdn
}

output "front_door_endpoint" {
  description = "Front Door endpoint hostname"
  value       = var.enable_front_door ? azurerm_cdn_frontdoor_endpoint.main[0].host_name : null
}

output "postgres_fqdn" {
  value     = azurerm_postgresql_flexible_server.main.fqdn
  sensitive = true
}

output "redis_hostname" {
  value     = azurerm_redis_cache.main.hostname
  sensitive = true
}

output "storage_account_name" {
  value = azurerm_storage_account.main.name
}

output "key_vault_uri" {
  value = azurerm_key_vault.main.vault_uri
}

output "log_analytics_workspace_id" {
  value = azurerm_log_analytics_workspace.main.id
}
