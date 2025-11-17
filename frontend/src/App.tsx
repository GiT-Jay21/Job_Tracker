import React from 'react'
import { Layout, Typography } from 'antd'
import JobList from './components/JobList'
import CreateJobForm from './components/CreateJobForm'
import { useState } from 'react'

const { Header, Content } = Layout
const { Title } = Typography

export default function App() {
  const [reloadKey, setReloadKey] = useState(0)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header>
        <Title style={{ color: 'white', margin: 0 }} level={3}>
          Job Tracker
        </Title>
      </Header>
      <Content style={{ padding: 24 }}>
        <CreateJobForm onCreated={() => setReloadKey((k) => k + 1)} />
        <JobList reloadKey={reloadKey} />
      </Content>
    </Layout>
  )
}
