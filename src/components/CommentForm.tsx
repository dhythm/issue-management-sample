import { FC } from "react";
import { Form, Select, Input, Button } from "antd";
import { api } from "@/utils/api";

type Values = {
  userId: string;
  content: string;
};

type Props = {
  onSubmit: (values: Values) => void;
};

export const CommentForm: FC<Props> = ({ onSubmit }) => {
  const [form] = Form.useForm();

  const users = api.user.getUsers.useQuery();
  const userOptions =
    users.data?.map((user) => ({
      label: user.name,
      value: user.id,
    })) ?? [];

  return (
    <Form
      name="comment"
      form={form}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      initialValues={{}}
      onFinish={onSubmit}
      autoComplete="off"
    >
      <Form.Item label="User" name="userId" rules={[{ required: true }]}>
        <Select options={userOptions} />
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
