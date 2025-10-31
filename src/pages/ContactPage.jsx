import React, { useState } from "react";
import { Row, Col, Form, Input, Button, Alert, Card } from "antd";
import { UserOutlined, MailOutlined, FormOutlined, MessageOutlined, PhoneOutlined, HomeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Helmet } from "react-helmet";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";

const ContactPage = () => {
  const [status, setStatus] = useState({
    submitted: false,
    submitting: false,
    info: { error: false, msg: null }
  });

  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    setStatus({
      submitted: false,
      submitting: true,
      info: { error: false, msg: null }
    });

    const formData = new FormData();
    for (const key in values) {
      formData.append(key, values[key]);
    }

    const xhr = new XMLHttpRequest();
    
    // Thay YOUR_FORMSPREE_FORM_ID bằng ID form của bạn từ Formspree
    xhr.open("POST", "https://formspree.io/f/mrboyvzw");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) return;
      if (xhr.status === 200) {
        form.resetFields();
        setStatus({
          submitted: true,
          submitting: false,
          info: { error: false, msg: "Cảm ơn bạn! Tin nhắn của bạn đã được gửi thành công." }
        });
      } else {
        setStatus({
          submitted: false,
          submitting: false,
          info: { error: true, msg: "Có lỗi xảy ra. Vui lòng thử lại sau." }
        });
      }
    };
    xhr.send(formData);
  };

  return (
    <>
      <Header />
      <div className="py-5" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <Helmet>
          <title>Liên hệ - Maison de Flavors</title>
          <meta name="description" content="Liên hệ với nhà hàng 5 sao Maison de Flavors" />
        </Helmet>
        
        <Row justify="center" style={{ marginBottom: '40px' }}>
          <Col xs={24} md={16} lg={12}>
            <h1 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '2.5em', color: '#333' }}>Liên hệ với chúng tôi</h1>
            <p style={{ textAlign: 'center', marginBottom: '40px', fontSize: '1.1em', color: '#666' }}>
              Hãy liên hệ với Maison de Flavors để đặt bàn, góp ý hoặc hợp tác. Chúng tôi luôn sẵn sàng lắng nghe bạn!
            </p>
          </Col>
        </Row>

        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} md={12} lg={8}>
            {status.info.error && (
              <Alert message={status.info.msg} type="error" showIcon style={{ marginBottom: '20px' }} />
            )}
            {status.submitted && (
              <Alert message={status.info.msg} type="success" showIcon style={{ marginBottom: '20px' }} />
            )}

            <Card title="Gửi tin nhắn cho chúng tôi" bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
              <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Form.Item
                  label="Họ và tên"
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên của bạn!' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên của bạn" />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ email của bạn!' }, { type: 'email', message: 'Email không hợp lệ!' }]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Nhập địa chỉ email của bạn" />
                </Form.Item>

                <Form.Item
                  label="Tiêu đề"
                  name="subject"
                  rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                >
                  <Input prefix={<FormOutlined />} placeholder="Nhập tiêu đề" />
                </Form.Item>

                <Form.Item
                  label="Nội dung"
                  name="message"
                  rules={[{ required: true, message: 'Vui lòng nhập nội dung tin nhắn của bạn!' }]}
                >
                  <Input.TextArea prefix={<MessageOutlined />} rows={5} placeholder="Nhập nội dung tin nhắn của bạn" />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    block
                    loading={status.submitting}
                    style={{ height: '45px', fontSize: '18px', borderRadius: '5px' }}
                  >
                    {status.submitting ? "Đang gửi..." : "Gửi tin nhắn"}
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Card title="Thông tin liên hệ" bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', height: '100%' }}>
              <div style={{ marginBottom: '20px' }}>
                <h4><HomeOutlined /> Địa chỉ</h4>
                <p>123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4><PhoneOutlined /> Điện thoại</h4>
                <p>+84 28 1234 5678</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4><MailOutlined /> Email</h4>
                <p>info@maisonflavors.com</p>
              </div>

              <div>
                <h4><ClockCircleOutlined /> Giờ mở cửa</h4>
                <p>Thứ 2 - Chủ nhật: 10:00 - 22:00</p>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
      <Footer />
    </>
  );
};

export default ContactPage;