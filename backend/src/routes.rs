// HTTP handlers and routing for job-related endpoints.

use axum::{
    extract::{Extension, Path},
    Json, http::StatusCode,
};
use mongodb::bson::{doc, Document};
use chrono::Utc;
// bring the TryStreamExt trait into scope so we can call `try_next()` on the Mongo cursor
use futures::TryStreamExt;

use crate::{db, models::{Job, CreateJobDto}};
use mongodb::Client;

// build a small router we can merge in main.rs
pub fn job_routes() -> axum::Router {
    use axum::routing::{get, post, put, delete};
    axum::Router::new()
        .route("/jobs", get(get_jobs))
        .route("/jobs", post(create_job))
        .route("/jobs/:id", get(get_job))
        .route("/jobs/:id", put(update_job))
        .route("/jobs/:id", delete(delete_job))
}

async fn get_jobs(Extension(client): Extension<Client>) -> Result<Json<Vec<Job>>, (StatusCode, String)> {
    let coll = db::jobs_collection(&client);
    let filter = doc! { "deleted_at": {"$exists": false} };

    let mut cursor = coll.find(filter, None)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)))?;

    let mut out = Vec::new();
    while let Some(doc) = cursor.try_next().await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Cursor error: {}", e)))? {
        // Map fields from the BSON document into our Job type. Keep mapping
        // explicit so the behavior is clear and easy to follow.
        let id = doc.get_i64("id").unwrap_or_else(|_| Utc::now().timestamp());
        let title = doc.get_str("title").unwrap_or_default().to_string();
        let company = doc.get_str("company").unwrap_or_default().to_string();
        let status = doc.get_str("status").unwrap_or_default().to_string();

        // Optional date stored as BSON DateTime -> convert to chrono::NaiveDateTime
        let applied_at = doc.get_datetime("applied_at").ok().map(|dt| chrono::DateTime::<Utc>::from(dt.to_system_time()).naive_utc());

        // Optional string fields
        let notes = doc.get("notes").and_then(|v| v.as_str().map(|s| s.to_string()));
        let source = doc.get("source").and_then(|v| v.as_str().map(|s| s.to_string()));
        let date_applied = doc.get("date_applied").and_then(|v| v.as_str().map(|s| s.to_string()));
        let place = doc.get("place").and_then(|v| v.as_str().map(|s| s.to_string()));
        // salary may be stored as an i64 or f64 in BSON; try both
        let salary = doc.get_i64("salary").ok().map(|v| v as f64)
            .or_else(|| doc.get_f64("salary").ok());

        out.push(Job { id, title, company, status, applied_at, notes, source, date_applied, place, salary });
    }

    Ok(Json(out))
}

async fn create_job(Extension(client): Extension<Client>, Json(body): Json<CreateJobDto>) -> Result<Json<i64>, (StatusCode, String)> {
    let coll = db::jobs_collection(&client);

    // naive id generation for demo purposes
    let id = Utc::now().timestamp();
    let now = mongodb::bson::DateTime::now();

    let status = body.status.unwrap_or_else(|| "applied".to_string());

    let mut doc = Document::new();
    doc.insert("id", id);
    doc.insert("title", body.title);
    doc.insert("company", body.company);
    doc.insert("status", status);
    doc.insert("created_at", now.clone());
    doc.insert("updated_at", now.clone());
    if let Some(notes) = body.notes {
        doc.insert("notes", notes);
    }
    if let Some(source) = body.source {
        doc.insert("source", source);
    }
    if let Some(date_applied) = body.date_applied {
        doc.insert("date_applied", date_applied);
    }
    if let Some(place) = body.place {
        doc.insert("place", place);
    }
    if let Some(salary) = body.salary {
        doc.insert("salary", salary);
    }

    coll.insert_one(doc, None).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)))?;

    Ok(Json(id))
}

async fn get_job(Extension(client): Extension<Client>, Path(id): Path<i64>) -> Result<Json<Job>, (StatusCode, String)> {
    let coll = db::jobs_collection(&client);
    let filter = doc! { "id": id, "deleted_at": {"$exists": false} };
    if let Some(doc) = coll.find_one(filter, None).await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)))? {
        let id = doc.get_i64("id").unwrap_or_else(|_| Utc::now().timestamp());
        let title = doc.get_str("title").unwrap_or_default().to_string();
        let company = doc.get_str("company").unwrap_or_default().to_string();
        let status = doc.get_str("status").unwrap_or_default().to_string();
    let applied_at = doc.get_datetime("applied_at").ok().map(|dt| chrono::DateTime::<Utc>::from(dt.to_system_time()).naive_utc());
    let notes = doc.get("notes").and_then(|v| v.as_str().map(|s| s.to_string()));
    let source = doc.get("source").and_then(|v| v.as_str().map(|s| s.to_string()));
    let date_applied = doc.get("date_applied").and_then(|v| v.as_str().map(|s| s.to_string()));
    let place = doc.get("place").and_then(|v| v.as_str().map(|s| s.to_string()));
    let salary = doc.get_i64("salary").ok().map(|v| v as f64)
        .or_else(|| doc.get_f64("salary").ok());
    let job = Job { id, title, company, status, applied_at, notes, source, date_applied, place, salary };
        Ok(Json(job))
    } else {
        Err((StatusCode::NOT_FOUND, format!("Job {} not found", id)))
    }
}

async fn update_job(Extension(client): Extension<Client>, Path(id): Path<i64>, Json(body): Json<CreateJobDto>) -> Result<Json<i64>, (StatusCode, String)> {
    let coll = db::jobs_collection(&client);
    let now = mongodb::bson::DateTime::now();
    let mut set_doc = Document::new();
    set_doc.insert("title", body.title);
    set_doc.insert("company", body.company);
    set_doc.insert("status", body.status.unwrap_or_else(|| "applied".to_string()));
    set_doc.insert("updated_at", now);
    if let Some(notes) = body.notes {
        set_doc.insert("notes", notes);
    }
    if let Some(source) = body.source {
        set_doc.insert("source", source);
    }
    if let Some(date_applied) = body.date_applied {
        set_doc.insert("date_applied", date_applied);
    }
    if let Some(place) = body.place {
        set_doc.insert("place", place);
    }
    if let Some(salary) = body.salary {
        set_doc.insert("salary", salary);
    }

    let result = coll.update_one(doc! {"id": id, "deleted_at": {"$exists": false}}, doc! {"$set": set_doc}, None)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)))?;

    if result.matched_count == 0 {
        Err((StatusCode::NOT_FOUND, format!("Job {} not found", id)))
    } else {
        Ok(Json(id))
    }
}

async fn delete_job(Extension(client): Extension<Client>, Path(id): Path<i64>) -> Result<StatusCode, (StatusCode, String)> {
    let coll = db::jobs_collection(&client);
    let now = mongodb::bson::DateTime::now();

    let result = coll.update_one(doc! {"id": id, "deleted_at": {"$exists": false}}, doc! {"$set": {"deleted_at": now}}, None)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e)))?;

    if result.modified_count == 0 {
        Err((StatusCode::NOT_FOUND, format!("Job {} not found", id)))
    } else {
        Ok(StatusCode::NO_CONTENT)
    }
}
