provider "google" {
  project = "jusartificial-prod"
  region  = "southamerica-east1"
}

# Phase 13: Encrypted Backups & Storage
resource "google_storage_bucket" "documents" {
  name          = "jusartificial-documents-prod"
  location      = "SOUTHAMERICA-EAST1"
  force_destroy = false

  encryption {
    default_kms_key_name = google_kms_crypto_key.storage_key.id
  }

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 3650 # 10 years retention (Legal requirement)
    }
    action {
      type = "SetStorageClass"
      storage_class = "ARCHIVE"
    }
  }
}

resource "google_kms_key_ring" "keyring" {
  name     = "jusartificial-keyring"
  location = "southamerica-east1"
}

resource "google_kms_crypto_key" "storage_key" {
  name            = "storage-key"
  key_ring        = google_kms_key_ring.keyring.id
  rotation_period = "7776000s" # 90 days
}
