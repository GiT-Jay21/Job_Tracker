// Simple data model for a job application tracker.
//
// Keep comments short and informative. This file defines the main domain
// shapes (Job and CreateJobDto) used throughout the backend.

use serde::{Deserialize, Serialize};
use chrono::NaiveDateTime;

// Ensure Job is serializable/deserializable for HTTP responses and DB I/O.
#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct Job {
    // simple numeric id — in a real app you might prefer ObjectId or a UUID
    pub id: i64,
    pub title: String,
    pub company: String,
    pub status: String, // e.g. "applied", "interviewing", "offer", "rejected"
    pub applied_at: Option<NaiveDateTime>,
    pub notes: Option<String>,
    // Optional: where the user found the job (e.g., LinkedIn) and a simple
    // date string representing when they applied.
    pub source: Option<String>,
    pub date_applied: Option<String>,
    // Optional place (site/city) and salary fields added for frontend
    // compatibility.
    pub place: Option<String>,
    pub salary: Option<f64>,
}

// DTO used when creating a job. Keep fields optional where possible so
// older clients do not break when we extend the model.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateJobDto {
    pub title: String,
    pub company: String,
    pub status: Option<String>,
    pub notes: Option<String>,
    // optional fields to allow gradual adoption without breaking existing clients
    pub source: Option<String>,
    pub date_applied: Option<String>,
    pub place: Option<String>,
    pub salary: Option<f64>,
}
