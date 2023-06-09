import { type NextPage } from "next";
import Head from "next/head";
import { api } from "@/utils/api";
import { Button, Layout, Modal, Space, Table, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  CheckCircleTwoTone,
  CheckOutlined,
  CommentOutlined,
  MoreOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { CommentForm, IssueForm } from "@/components";
import { Review, Thread, User } from "@prisma/client";

type DataType = {
  id: string;
  key: string;
  title: string;
  threads: (Thread & {
    comments: (Comment & { user: User })[];
    user: User;
  })[];
  reviews: (Review & { reviewer: User })[];
  createdAt: string;
};

const columns: ColumnsType<DataType> = [
  { title: "Title", dataIndex: "title", key: "title" },
  { title: "Key", dataIndex: "key", key: "key" },
  { title: "CreatedAt", dataIndex: "createdAt", key: "createdAt" },
];

const Home: NextPage = () => {
  const [openIssueForm, setOpenIssueForm] = useState(false);
  const [openCommentForm, setOpenCommentForm] = useState<
    { issueId: string; threadId: string; open: true } | { open: false }
  >({ open: false });

  const issues = api.issue.getIssues.useQuery();
  const createIssueMutation = api.issue.createIssue.useMutation();
  const createThreadMutation = api.comment.createThread.useMutation();
  const resolveThreadMutation = api.comment.resolveThread.useMutation();
  const createCommentMutation = api.comment.createComment.useMutation();

  const data = issues.data?.map((issue) => ({
    id: issue.id,
    key: issue.key,
    title: issue.title,
    threads: issue.threads,
    reviews: issue.reviews,
    createdAt: issue.createdAt.toISOString(),
  }));

  return (
    <>
      <Head>
        <title>Issue Management Sample</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Layout>
          <Layout.Header>
            <Space wrap>
              <Button
                type="primary"
                icon={<PlusCircleOutlined />}
                onClick={() => setOpenIssueForm(true)}
              >
                Issue
              </Button>
            </Space>
          </Layout.Header>
          <Layout.Content>
            <Table
              dataSource={data}
              pagination={false}
              expandable={{
                expandedRowRender: (record) => (
                  <Table
                    dataSource={record.threads.map((thread) => ({
                      id: thread.id,
                      title: thread.title,
                      resolved: thread.resolved,
                      createdAt: thread.createdAt.toISOString(),
                      comments: thread.comments,
                      user: thread.user,
                    }))}
                    pagination={false}
                    expandable={{
                      expandedRowRender: (record) => (
                        <Table
                          dataSource={record.comments.map((comment) => ({
                            id: comment.id,
                            content: comment.content,
                            createdAt: comment.createdAt.toISOString(),
                            user: comment.user,
                          }))}
                          pagination={false}
                        >
                          <Table.Column
                            title="Content"
                            dataIndex="content"
                            key="content"
                          />
                          <Table.Column
                            title="User"
                            key="user"
                            render={(_, record: Comment & { user: User }) => (
                              <Typography.Text>
                                {record.user.name}
                              </Typography.Text>
                            )}
                          />
                          <Table.Column
                            title="CommentedAt"
                            dataIndex="createdAt"
                            key="createdAt"
                          />
                        </Table>
                      ),
                    }}
                  >
                    <Table.Column title="title" dataIndex="title" key="title" />
                    <Table.Column
                      title="resolved"
                      key="resolved"
                      render={(_, { resolved }: Thread & { user: User }) =>
                        resolved ? (
                          <CheckCircleTwoTone twoToneColor="#52c41a" />
                        ) : null
                      }
                    />
                    <Table.Column
                      title="Author"
                      key="author"
                      render={(_, record: Thread & { user: User }) => (
                        <Typography.Text>{record.user.name}</Typography.Text>
                      )}
                    />
                    <Table.Column
                      title="CreatedAt"
                      dataIndex="createdAt"
                      key="createdAt"
                    />
                    <Table.Column
                      title="action"
                      key="action"
                      render={(_, record: Thread) => (
                        <Space size="middle">
                          <Button
                            shape="circle"
                            icon={<CommentOutlined />}
                            onClick={() =>
                              setOpenCommentForm({
                                issueId: "",
                                threadId: record.id,
                                open: true,
                              })
                            }
                          />
                          <Button
                            shape="circle"
                            icon={<CheckOutlined />}
                            disabled={record.resolved}
                            onClick={async () => {
                              await resolveThreadMutation.mutateAsync({
                                id: record.id,
                              });
                              issues.refetch();
                            }}
                          />
                        </Space>
                      )}
                    />
                  </Table>
                ),
              }}
            >
              {columns.map((column) => (
                <Table.Column
                  title={column.title}
                  dataIndex={column.dataIndex}
                  key={column.key}
                />
              ))}
              <Table.Column
                title="Reviewers"
                key="reviewers"
                render={(_, record: DataType) => (
                  <>
                    {record.reviews.map((review) => {
                      const color =
                        review.type === "intermediate" ? "geekblue" : "green";
                      return (
                        <Tag color={color} key={review.id}>
                          {review.reviewer.name}
                        </Tag>
                      );
                    })}
                  </>
                )}
              />
              <Table.Column
                title="Action"
                key="action"
                render={(_, record: DataType) => (
                  <Space size="middle">
                    <Button
                      shape="circle"
                      icon={<CommentOutlined />}
                      onClick={() =>
                        setOpenCommentForm({
                          issueId: record.id,
                          threadId: "",
                          open: true,
                        })
                      }
                    />
                    <Button shape="circle" icon={<MoreOutlined />} />
                  </Space>
                )}
              />
            </Table>
          </Layout.Content>
        </Layout>
        <Layout.Footer></Layout.Footer>

        <Modal
          title="Create issue"
          open={openIssueForm}
          onCancel={() => setOpenIssueForm(false)}
          footer={[]}
        >
          <IssueForm
            onSubmit={async (values) => {
              console.log("Received values of forms:", values);
              try {
                await createIssueMutation.mutateAsync({ ...values });
                issues.refetch();
                setOpenIssueForm(false);
              } catch (e) {
                console.error(e);
              }
            }}
          />
        </Modal>

        {openCommentForm.open && (
          <Modal
            title="Create comment"
            open
            onCancel={() => setOpenCommentForm({ open: false })}
            footer={[]}
          >
            <CommentForm
              onSubmit={async (values) => {
                console.log("Received values of forms:", values);
                try {
                  if (!openCommentForm.threadId) {
                    await createThreadMutation.mutateAsync({
                      title: values.content,
                      issueId: openCommentForm.issueId,
                      userId: values.userId,
                    });
                  } else {
                    await createCommentMutation.mutateAsync({
                      ...values,
                      threadId: openCommentForm.threadId,
                    });
                  }
                  issues.refetch();
                  setOpenCommentForm({ open: false });
                } catch (e) {
                  console.error(e);
                }
              }}
            />
          </Modal>
        )}
      </main>
    </>
  );
};

export default Home;
