import { FC } from "react";
import { Form, Select, Input, Button } from "antd";
import { api } from "@/utils/api";

type Props = {
  onSubmit: (values: any) => void;
};

export const IssueForm: FC<Props> = ({ onSubmit }) => {
  const [form] = Form.useForm();

  const users = api.user.getUsers.useQuery();
  const userOptions =
    users.data?.map((user) => ({
      label: user.name,
      value: user.id,
    })) ?? [];

  return (
    <Form
      name="issue"
      form={form}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      initialValues={{}}
      onFinish={onSubmit}
      autoComplete="off"
    >
      <Form.Item label="Author" name="authorId" rules={[{ required: true }]}>
        <Select options={userOptions} />
      </Form.Item>
      <Form.Item
        label="Assignee"
        name="assigneeId"
        rules={[{ required: true }]}
      >
        <Select options={userOptions} />
      </Form.Item>
      <Form.Item label="Key" name="key" rules={[{ required: true }]}>
        <Select
          options={[
            { label: "Requirement", value: "requirement" },
            { label: "Budget", value: "budget" },
          ]}
        />
      </Form.Item>
      <Form.Item label="Title" name="title" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Content" name="content" rules={[{ required: true }]}>
        <Input.TextArea />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};
