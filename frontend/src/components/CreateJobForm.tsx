import React, { useState } from 'react'
import { Form, Input, Button, message, DatePicker, Select, InputNumber } from 'antd'
// Form for creating a new job. Keep comments short and focused: describe what
// a block does (validation, transform, API call), not every implementation detail.
import api from '../api'

type Props = {
  onCreated?: () => void
}

export default function CreateJobForm({ onCreated }: Props) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      // Prepare payload: convert date_applied (Dayjs) to ISO string if present.
      const payload = { ...values }
      if (payload.date_applied && typeof payload.date_applied.toISOString !== 'function') {
        // Dayjs objects have toISOString method; call it to get an ISO string
        try {
          payload.date_applied = payload.date_applied.toISOString()
        } catch (e) {
          // fallback: try format if provided
          if (typeof payload.date_applied.format === 'function') {
            payload.date_applied = payload.date_applied.format()
          }
        }
      }

  // Log the outgoing request for debugging.
  console.debug('POST', api.defaults.baseURL + '/jobs', payload)
      await api.post('/jobs', payload)
      form.resetFields()
      message.success('Job created!')
      onCreated?.()
    } catch (err) {
      // AxiosError includes response/status when available
      // Log full error and show a helpful message with status if present
      // @ts-ignore
      const status = err?.response?.status
      // @ts-ignore
      const data = err?.response?.data
      console.error('Create job failed', { err, status, data })
      if (status) {
        message.error(`Failed to create job (${status})`)
      } else {
        message.error('Failed to create job')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form form={form} layout="inline" onFinish={onFinish} style={{ marginBottom: 16 }}>
      {/* autofocus the title input so users can start typing immediately */}
      <Form.Item name="title" rules={[{ required: true, message: 'Please enter a title' }]}> 
        <Input placeholder="Title (required)" autoFocus />
      </Form.Item>

      <Form.Item name="company" rules={[{ required: true, message: 'Please enter a company' }]}> 
        <Input placeholder="Company (required)" />
      </Form.Item>

      <Form.Item name="status">
        <Select placeholder="Select status (optional)" style={{ width: 180 }}>
          <Select.Option value="applied">Applied</Select.Option>
          <Select.Option value="pending">Pending</Select.Option>
          <Select.Option value="interviewing">Interviewing</Select.Option>
          <Select.Option value="offer">Offer</Select.Option>
          <Select.Option value="rejected">Rejected</Select.Option>
          <Select.Option value="not_applied">Not Applied</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item name="notes" style={{ minWidth: 240 }}>
        <Input placeholder="Notes or URL (optional)" />
      </Form.Item>

      {/* new optional fields */}
      <Form.Item name="source">
        <Input placeholder="Source (optional) - e.g. LinkedIn, Referral" />
      </Form.Item>

      <Form.Item name="place">
        <Select
          showSearch
          placeholder="Select place/site (optional)"
          style={{ width: 220 }}
          allowClear
          optionFilterProp="children"
          // case-insensitive contains matcher so typing 'ban' matches 'Bangalore'
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

      <Form.Item name="salary">
        <InputNumber style={{ width: 160 }} placeholder="Salary (optional)" min={0} formatter={value => value ? `$ ${value}` : ''} />
      </Form.Item>

      <Form.Item name="date_applied">
        <DatePicker />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  )
}
