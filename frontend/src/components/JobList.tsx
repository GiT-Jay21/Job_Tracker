import React, { useEffect, useState } from 'react'
import { List, Spin, Button, Modal, message } from 'antd'
import api, { getJobs } from '../api'
import { DeleteOutlined } from '@ant-design/icons'
import type { Job } from '../types'
import JobViewModal from './JobViewModal'

// Simple job list renderer. Keep UI defensive: backend may omit fields,
// so render fallbacks and avoid throwing in render path.

type Props = {
  reloadKey?: number
}

export default function JobList({ reloadKey }: Props) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await getJobs()
      setJobs(res.data || [])
    } catch (err) {
      console.error('API error', err)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [reloadKey])

  // Show a confirmation dialog before deleting. On OK, call API and refresh.
  function confirmDelete(id: number) {
    Modal.confirm({
      title: 'Are you sure you want to delete this job?',
      okText: 'OK',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.delete(`/jobs/${id}`)
          message.success('Job Deleted!')
          fetchJobs()
        } catch (e) {
          console.error('Delete failed', e)
          message.error('Delete failed')
        }
      }
    })
  }

  if (loading) return <Spin />

  return (
    <>
      <List
      bordered
      dataSource={jobs}
      renderItem={(item) => {
        const dateStr = item.date_applied ? (() => {
          try {
            return new Date(item.date_applied!).toLocaleDateString()
          } catch (e) {
            return item.date_applied
          }
        })() : undefined

        const extraParts = [
          item.status,
          item.source ? `Source: ${item.source}` : undefined,
          dateStr ? `Applied: ${dateStr}` : undefined,
        ].filter(Boolean).join(' • ')

        const desc = `${extraParts}${item.notes ? ' — ' + item.notes : ''}`

        return (
          <List.Item
            key={item.id}
            actions={[
              <Button
                key="view"
                onClick={() => {
                  setSelectedJob(item)
                  setModalVisible(true)
                }}
              >
                View
              </Button>,
              <Button
                key="delete"
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => confirmDelete(item.id)}
              />,
            ]}
          >
            <List.Item.Meta
              title={`${item.title || '—'} @ ${item.company || '—'}`}
              description={desc}
            />
          </List.Item>
        )
      }}
      locale={{ emptyText: 'No jobs yet' }}
      />

      {/* View modal */}
      <JobViewModal
        visible={modalVisible}
        job={selectedJob}
        onClose={() => {
          setModalVisible(false)
          setSelectedJob(null)
        }}
        onUpdated={() => {
          // refresh list after a successful update
          fetchJobs()
        }}
      />
    </>
  )
}
