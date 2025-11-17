import React, { useState, useEffect } from 'react'
import { Modal, Typography, Button, Space, Form, Input, Select, DatePicker, message, InputNumber } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import type { Job } from '../types'
import { updateJob } from '../api'
import dayjs from 'dayjs'

const { Title, Paragraph } = Typography

type Props = {
  visible: boolean
  job?: Job | null
  onClose: () => void
  // called after a successful update so parents can refresh
  onUpdated?: (id: number) => void
}

// Modal that shows a job's details. Tracks a local `isEditing` boolean so the
// UI can switch to edit mode; clicking the Edit icon sets it to true.
export default function JobViewModal({ visible, job, onClose, onUpdated }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    // populate form when modal opens or job changes
    if (job) {
      form.setFieldsValue({
        title: job.title,
        company: job.company,
        status: job.status,
        place: job.place,
        salary: job.salary,
        notes: job.notes,
        source: job.source,
        date_applied: job.date_applied ? dayjs(job.date_applied) : undefined,
      })
    } else {
      form.resetFields()
    }
    // reset editing state when modal closed
    if (!visible) setIsEditing(false)
  }, [job, visible, form])

  const titleNode = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ marginRight: 12 }}>{job ? `${job.title} @ ${job.company}` : 'Job'}</div>
      <Space>
        {/* Edit button in the title area toggles editing state */}
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => setIsEditing(true)}
          aria-label="Edit"
        />
      </Space>
    </div>
  )

  return (
    <Modal
      open={visible}
      title={titleNode}
      onCancel={() => {
        setIsEditing(false)
        onClose()
      }}
      footer={null}
    >
      <div>
        {isEditing ? (
          // Simple inline edit form. On save we call the backend and notify parent.
          <Form form={form} layout="vertical" onFinish={async (values) => {
            if (!job) return
            try {
              const payload = { ...values }
              if (payload.date_applied && payload.date_applied.toISOString) {
                payload.date_applied = payload.date_applied.toISOString()
              }
              await updateJob(job.id, payload)
              message.success('Job updated')
              setIsEditing(false)
              onUpdated?.(job.id)
            } catch (e) {
              console.error('Update failed', e)
              message.error('Update failed')
            }
          }}>
            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="company" label="Company" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="status" label="Status">
              <Select>
                <Select.Option value="applied">Applied</Select.Option>
                <Select.Option value="pending">Pending</Select.Option>
                <Select.Option value="interviewing">Interviewing</Select.Option>
                <Select.Option value="offer">Offer</Select.Option>
                <Select.Option value="rejected">Rejected</Select.Option>
                <Select.Option value="not_applied">Not Applied</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="source" label="Source">
              <Input />
            </Form.Item>

            <Form.Item name="place" label="Place">
              <Select
                showSearch
                placeholder="Select place/site"
                allowClear
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string || '').toLowerCase().includes(input.toLowerCase())
                }
              >
                <Select.Option value="Bangalore">Bangalore</Select.Option>
                <Select.Option value="Hyderabad">Hyderabad</Select.Option>
                <Select.Option value="Mumbai">Mumbai</Select.Option>
                <Select.Option value="Delhi">Delhi</Select.Option>
                <Select.Option value="Chennai">Chennai</Select.Option>
                <Select.Option value="Pune">Pune</Select.Option>
                <Select.Option value="Kolkata">Kolkata</Select.Option>
                <Select.Option value="Remote">Remote</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="salary" label="Salary">
              <InputNumber style={{ width: 200 }} min={0} formatter={value => value ? `$ ${value}` : ''} />
            </Form.Item>
            <Form.Item name="date_applied" label="Date Applied">
              <DatePicker />
            </Form.Item>
            <Form.Item name="notes" label="Notes">
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button htmlType="submit" type="primary">Save</Button>
                <Button onClick={() => { setIsEditing(false); form.resetFields() }}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        ) : (
          <>
            <Title level={5}>Details</Title>
            <Paragraph>
              <strong>Status:</strong> {job?.status ?? '—'}
            </Paragraph>
            {job?.place && (
              <Paragraph>
                <strong>Place:</strong> {job.place}
              </Paragraph>
            )}
            {typeof job?.salary !== 'undefined' && (
              <Paragraph>
                <strong>Salary:</strong> {job?.salary ? `$ ${job.salary}` : '—'}
              </Paragraph>
            )}
            {job?.source && (
              <Paragraph>
                <strong>Source:</strong> {job.source}
              </Paragraph>
            )}
            {job?.date_applied && (
              <Paragraph>
                <strong>Date applied:</strong> {new Date(job.date_applied).toLocaleDateString()}
              </Paragraph>
            )}
            {job?.notes && (
              <Paragraph>
                <strong>Notes:</strong> {job.notes}
              </Paragraph>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}
