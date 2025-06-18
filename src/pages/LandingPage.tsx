import React from "react";
import {
  Layout,
  Row,
  Col,
  Button,
  Typography,
  Card,
  Statistic,
  Collapse,
  Avatar,
} from "antd";
import {
  CheckCircleFilled,
  ArrowRightOutlined,
  BarChartOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  MobileOutlined,
  ApiOutlined,
  EditOutlined,
  FolderAddOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const { Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const features = [
  {
    icon: (
      <BarChartOutlined
        style={{
          fontSize: 48,
          color: "#10B981",
          background: "#F0FDF4",
          borderRadius: 24,
          padding: 8,
        }}
      />
    ),
    title: "Real-time Progress Tracking",
    desc: "Monitor project progress in real-time with visual charts and automatic notifications.",
  },
  {
    icon: (
      <AppstoreOutlined
        style={{
          fontSize: 48,
          color: "#3B82F6",
          background: "#EFF6FF",
          borderRadius: 24,
          padding: 8,
        }}
      />
    ),
    title: "Multi-Project Management",
    desc: "Manage multiple projects simultaneously with clear permissions for team members and clients.",
  },
  {
    icon: (
      <FileTextOutlined
        style={{
          fontSize: 48,
          color: "#F59E0B",
          background: "#FEF3C7",
          borderRadius: 24,
          padding: 8,
        }}
      />
    ),
    title: "Automated Reporting",
    desc: "Generate progress reports automatically and send email notifications when updates are available.",
  },
  {
    icon: (
      <SafetyCertificateOutlined
        style={{
          fontSize: 48,
          color: "#EF4444",
          background: "#FEF2F2",
          borderRadius: 24,
          padding: 8,
        }}
      />
    ),
    title: "Enterprise Security",
    desc: "End-to-end encryption and detailed access control ensure your project data is secure.",
  },
  {
    icon: (
      <MobileOutlined
        style={{
          fontSize: 48,
          color: "#8B5CF6",
          background: "#F3F0FF",
          borderRadius: 24,
          padding: 8,
        }}
      />
    ),
    title: "Mobile Responsive",
    desc: "Optimized interface for all devices, from desktop to mobile, ensuring consistent experience.",
  },
  {
    icon: (
      <ApiOutlined
        style={{
          fontSize: 48,
          color: "#14B8A6",
          background: "#ECFEFF",
          borderRadius: 24,
          padding: 8,
        }}
      />
    ),
    title: "Easy Integration",
    desc: "Open API and webhooks support for integrating with existing project management tools.",
  },
];

const stats = [
  { value: "10,000+", title: "Projects Managed", color: "#3B82F6" },
  { value: "500+", title: "Happy Clients", color: "#10B981" },
  { value: "99.9%", title: "Uptime", color: "#F59E0B" },
  { value: "24/7", title: "Support", color: "#EF4444" },
];

const faqs = [
  {
    q: "How does the free trial work?",
    a: "You get full access to all Professional features for 14 days. No credit card required. After the trial, you can choose to upgrade or continue with our free Starter plan.",
  },
  {
    q: "Can I change plans anytime?",
    a: "Yes, you can upgrade or downgrade your plan at any time from your account dashboard.",
  },
  {
    q: "Is my data secure?",
    a: "We use end-to-end encryption and strict permissions to ensure your data is always safe.",
  },
  {
    q: "Do you offer customer support?",
    a: "Yes, our support team is available 24/7 to assist you with any questions or issues.",
  },
];

const testimonials = [
  {
    quote:
      "ProgressHub transformed how we communicate with clients. The real-time updates and automated reports save us hours every week.",
    name: "Sarah Johnson",
    role: "Project Manager, TechCorp",
    img: "/img/team-member1.png",
  },
  {
    quote:
      "The transparency and ease of use made our client relationships stronger. We can focus on delivery instead of status meetings.",
    name: "Michael Chen",
    role: "CEO, Digital Solutions",
    img: "/img/team-member3.png",
  },
  {
    quote:
      "Finally, a tool that both our team and clients love to use. The interface is intuitive and the features are exactly what we needed.",
    name: "Emily Rodriguez",
    role: "Operations Director, StartupXYZ",
    img: "/img/team-member1.png",
  },
];

const plans = [
  {
    name: "Starter",
    desc: "Perfect for small projects",
    price: "$29",
    period: "/month",
    features: [
      "Up to 3 projects",
      "5 team members",
      "Basic reporting",
      "Email support",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Professional",
    desc: "Best for growing teams",
    price: "$79",
    period: "/month",
    features: [
      "Unlimited projects",
      "Unlimited team members",
      "Advanced reporting",
      "Priority support",
      "API access",
    ],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    desc: "Custom solutions",
    price: "Custom",
    period: "pricing",
    features: [
      "Everything in Professional",
      "24/7 phone support",
      "Custom integrations",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];
const steps = [
  {
    icon: (
      <FolderAddOutlined
        style={{
          fontSize: 32,
          color: "#3B82F6",
          background: "#EFF6FF",
          borderRadius: 16,
          padding: 4,
        }}
      />
    ),
    title: "Create Project",
    desc: "Set up project and team, define milestones, permissions.",
  },
  {
    icon: (
      <EditOutlined
        style={{
          fontSize: 32,
          color: "#10B981",
          background: "#F0FDF4",
          borderRadius: 16,
          padding: 4,
        }}
      />
    ),
    title: "Update Progress",
    desc: "Admins and members update progress, upload docs.",
  },
  {
    icon: (
      <BarChartOutlined
        style={{
          fontSize: 32,
          color: "#F59E0B",
          background: "#FEF3C7",
          borderRadius: 16,
          padding: 4,
        }}
      />
    ),
    title: "Track & Report",
    desc: "Clients monitor progress in real time, get reports.",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const cardHover = {
  whileHover: { scale: 1.05, boxShadow: "0px 15px 25px rgba(0,0,0,0.2)" },
};

const LandingPage: React.FC = () => {
  const navigator = useNavigate();

  return (
    <div style={{ overflowX: "hidden" }}>
      <Layout style={{ width: "100%", margin: 0, padding: 0 }}>
        <Content>
          {/* Hero Section */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            style={{
              background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
              padding: "100px 0 60px 0",
              textAlign: "center",
            }}
          >
            <Title
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 44,
                marginBottom: 16,
                lineHeight: 1.2,
              }}
            >
              Project Progress Tracking
              <br />
              Made Simple
            </Title>
            <Paragraph
              style={{ color: "#E2E8F0", fontSize: 18, marginBottom: 32 }}
            >
              Smart project management solution that keeps clients and teams
              updated with real-time progress tracking and automated reporting
            </Paragraph>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                type="primary"
                size="large"
                style={{
                  borderRadius: 8,
                  fontWeight: 600,
                  height: 48,
                  padding: "0 32px",
                  background: "#fff",
                  color: "#3B82F6",
                  border: "none",
                  marginBottom: 32,
                }}
                onClick={() => {
                  navigator("/login");
                }}
              >
                Start Free Trial <ArrowRightOutlined />
              </Button>
            </motion.div>

            {/* Dashboard Preview (Figma node 81:590) */}
            <div
              style={{
                margin: "0 auto",
                marginTop: 24,
                width: "100%",
                maxWidth: 900,
                background: "linear-gradient(180deg, #fff 80%, #f8fafc 100%)",
                borderRadius: 16,
                boxShadow: "0px 20px 60px 0px rgba(0,0,0,0.13)",
                padding: 24,
                display: "flex",
                gap: 16,
                justifyContent: "space-between",
                alignItems: "flex-start",
                boxSizing: "border-box",
              }}
            >
              {/* Left: Project Cards */}
              <div style={{ flex: 1, minWidth: 260 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 16,
                    color: "#111827",
                    marginBottom: 12,
                  }}
                >
                  Your Projects
                </div>
                {/* Project 1 */}
                <div
                  style={{
                    background: "#F8FAFC",
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: 14,
                        color: "#111827",
                      }}
                    >
                      ABC Company Website
                    </span>
                    <span
                      style={{
                        background: "#DCFCE7",
                        color: "#166534",
                        borderRadius: 10,
                        fontSize: 10,
                        padding: "0 8px",
                        height: 20,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      On Track
                    </span>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: "#64748B",
                      }}
                    >
                      <span>Progress</span>
                      <span
                        style={{
                          color: "#3B82F6",
                          fontWeight: 600,
                        }}
                      >
                        75%
                      </span>
                    </div>
                    <div
                      style={{
                        background: "#E2E8F0",
                        borderRadius: 3,
                        height: 6,
                        marginTop: 4,
                      }}
                    >
                      <div
                        style={{
                          width: "75%",
                          background: "#3B82F6",
                          height: 6,
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  </div>
                </div>
                {/* Project 2 */}
                <div
                  style={{
                    background: "#F8FAFC",
                    borderRadius: 8,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: 14,
                        color: "#111827",
                      }}
                    >
                      XYZ Mobile App
                    </span>
                    <span
                      style={{
                        background: "#FEF3C7",
                        color: "#92400E",
                        borderRadius: 10,
                        fontSize: 10,
                        padding: "0 8px",
                        height: 20,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      Behind
                    </span>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: "#64748B",
                      }}
                    >
                      <span>Progress</span>
                      <span
                        style={{
                          color: "#F59E0B",
                          fontWeight: 600,
                        }}
                      >
                        45%
                      </span>
                    </div>
                    <div
                      style={{
                        background: "#E2E8F0",
                        borderRadius: 3,
                        height: 6,
                        marginTop: 4,
                      }}
                    >
                      <div
                        style={{
                          width: "45%",
                          background: "#F59E0B",
                          height: 6,
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Right: Timeline */}
              <div style={{ flex: 2, minWidth: 340 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 16,
                    color: "#111827",
                    marginBottom: 12,
                  }}
                >
                  Recent Updates
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {/* Timeline Item 1 */}
                  <div style={{ display: "flex", gap: 12 }}>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        background: "#3B82F6",
                        marginTop: 8,
                      }}
                    />
                    <div
                      style={{
                        background: "#F8FAFC",
                        borderRadius: 8,
                        padding: 12,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 500,
                            fontSize: 14,
                            color: "#111827",
                          }}
                        >
                          UI Design Completed
                        </span>
                        <span style={{ fontSize: 12, color: "#64748B" }}>
                          2 hours ago
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#64748B",
                          marginTop: 4,
                        }}
                      >
                        Finished user interface design for the user management
                        module
                      </div>
                    </div>
                  </div>
                  {/* Timeline Item 2 */}
                  <div style={{ display: "flex", gap: 12 }}>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        background: "#10B981",
                        marginTop: 8,
                      }}
                    />
                    <div
                      style={{
                        background: "#F8FAFC",
                        borderRadius: 8,
                        padding: 12,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 500,
                            fontSize: 14,
                            color: "#111827",
                          }}
                        >
                          Database Updated
                        </span>
                        <span style={{ fontSize: 12, color: "#64748B" }}>
                          1 day ago
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#64748B",
                          marginTop: 4,
                        }}
                      >
                        Optimized database structure and added new tables
                      </div>
                    </div>
                  </div>
                  {/* Timeline Item 3 */}
                  <div style={{ display: "flex", gap: 12 }}>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        background: "#64748B",
                        marginTop: 8,
                      }}
                    />
                    <div
                      style={{
                        background: "#F8FAFC",
                        borderRadius: 8,
                        padding: 12,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 500,
                            fontSize: 14,
                            color: "#111827",
                          }}
                        >
                          Project Initialized
                        </span>
                        <span style={{ fontSize: 12, color: "#64748B" }}>
                          3 days ago
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#64748B",
                          marginTop: 4,
                        }}
                      >
                        Set up development environment and initial configuration
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
          {/* Features Section */}
          <motion.section
            id="features"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ background: "#fff", padding: "100px 0" }}
          >
            <Title
              level={2}
              style={{
                color: "#111827",
                fontWeight: 700,
                fontSize: 32,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Everything you need for project success
            </Title>
            <Paragraph
              style={{
                color: "#64748B",
                fontSize: 18,
                textAlign: "center",
                marginBottom: 48,
              }}
            >
              From progress tracking to document management, we've got you
              covered
            </Paragraph>
            <Row
              justify="center"
              style={{ padding: "0 150px" }}
              gutter={[32, 32]}
            >
              {features.map((f, idx) => (
                <Col
                  key={idx}
                  xs={24}
                  md={8}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <motion.div
                    {...cardHover}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                  >
                    <Card
                      variant="borderless"
                      style={{
                        borderRadius: 16,
                        boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
                        padding: 32,
                        minHeight: 260,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      {f.icon}
                      <Title
                        level={4}
                        style={{
                          marginTop: 24,
                          fontWeight: 600,
                          textAlign: "center",
                        }}
                      >
                        {f.title}
                      </Title>
                      <Paragraph
                        style={{
                          color: "#64748B",
                          fontSize: 16,
                          textAlign: "center",
                        }}
                      >
                        {f.desc}
                      </Paragraph>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.section>
          {/* Stats Section */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ background: "#F8FAFC", padding: "60px 0" }}
          >
            <Title
              level={2}
              style={{
                color: "#111827",
                fontWeight: 700,
                fontSize: 32,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Trusted by thousands
            </Title>
            <Paragraph
              style={{
                color: "#64748B",
                fontSize: 18,
                textAlign: "center",
                marginBottom: 48,
              }}
            >
              Join companies worldwide who trust ProgressHub
            </Paragraph>
            <Row justify="center" gutter={[64, 32]}>
              {stats.map((stat, idx) => (
                <Col xs={12} md={6} key={idx} style={{ textAlign: "center" }}>
                  <Statistic
                    value={stat.value}
                    title={stat.title}
                    valueStyle={{
                      color: stat.color,
                      fontWeight: 700,
                      fontSize: 32,
                    }}
                  />
                </Col>
              ))}
            </Row>
          </motion.section>
          {/* Steps Section */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ background: "#fff", padding: "100px 0" }}
          >
            <Title
              level={2}
              style={{
                color: "#111827",
                fontWeight: 700,
                fontSize: 32,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Simple process, maximum efficiency
            </Title>
            <Paragraph
              style={{
                color: "#64748B",
                fontSize: 18,
                textAlign: "center",
                marginBottom: 48,
              }}
            >
              Get started with project tracking in just 3 simple steps
            </Paragraph>
            <Row justify="center" gutter={[32, 32]}>
              {steps.map((s, idx) => (
                <Col
                  xs={24}
                  md={8}
                  key={idx}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <motion.div
                    {...cardHover}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                  >
                    {" "}
                    <Card
                      variant="borderless"
                      style={{
                        borderRadius: 8,
                        background: "#F8FAFC",
                        padding: 24,
                        width: "100%",
                        border: "none",
                      }}
                    >
                      <div style={{ marginBottom: 16 }}>{s.icon}</div>
                      <Title
                        level={4}
                        style={{
                          fontWeight: 600,
                          fontSize: 16,
                          color: "#111827",
                          margin: 0,
                          marginBottom: 4,
                        }}
                      >
                        {s.title}
                      </Title>
                      <Paragraph
                        style={{
                          color: "#64748B",
                          fontSize: 14,
                          margin: 0,
                        }}
                      >
                        {s.desc}
                      </Paragraph>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.section>
          {/* Testimonials Section */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ background: "#F8FAFC", padding: "100px 0" }}
          >
            <Title
              level={2}
              style={{
                color: "#111827",
                fontWeight: 700,
                fontSize: 32,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              What our clients say
            </Title>
            <Paragraph
              style={{
                color: "#64748B",
                fontSize: 18,
                textAlign: "center",
                marginBottom: 48,
              }}
            >
              Don't just take our word for it
            </Paragraph>
            <Row justify="center" gutter={[32, 32]}>
              {testimonials.map((t, idx) => (
                <Col
                  xs={24}
                  md={8}
                  key={idx}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <motion.div
                    {...cardHover}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                  >
                    <Card
                      variant="borderless"
                      style={{
                        borderRadius: 16,
                        boxShadow: "0 4px 20px 0 rgba(0,0,0,0.06)",
                        padding: 32,
                        minHeight: 220,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Paragraph
                        style={{
                          color: "#111827",
                          fontSize: 16,
                          fontStyle: "italic",
                          marginBottom: 24,
                          textAlign: "center",
                        }}
                      >
                        "{t.quote}"
                      </Paragraph>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                        }}
                      >
                        <Avatar src={t.img} size={48} />
                        <div>
                          <Text strong style={{ color: "#3B82F6" }}>
                            {t.name}
                          </Text>
                          <br />
                          <Text style={{ color: "#64748B", fontSize: 14 }}>
                            {t.role}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.section>
          {/* Pricing Section */}
          <motion.section
            id="pricing"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ background: "#fff", padding: "100px 0" }}
          >
            <Title
              level={2}
              style={{
                color: "#111827",
                fontWeight: 700,
                fontSize: 32,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Choose the plan that fits your needs
            </Title>
            <Paragraph
              style={{
                color: "#64748B",
                fontSize: 18,
                textAlign: "center",
                marginBottom: 48,
              }}
            >
              No hidden fees, cancel anytime
            </Paragraph>
            <Row justify="center" gutter={[32, 32]}>
              {plans.map((plan, idx) => (
                <Col
                  xs={24}
                  md={8}
                  key={idx}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <motion.div
                    {...cardHover}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                  >
                    <Card
                      variant="borderless"
                      style={{
                        borderRadius: 16,
                        boxShadow: plan.highlight
                          ? "0 8px 40px 0 rgba(59,130,246,0.25)"
                          : "0 4px 20px 0 rgba(0,0,0,0.06)",
                        padding: 32,
                        minHeight: 420,
                        background: plan.highlight ? "#3B82F6" : "#fff",
                        color: plan.highlight ? "#fff" : "#111827",
                        position: "relative",
                      }}
                    >
                      {plan.highlight && (
                        <div
                          style={{
                            position: "absolute",
                            top: 24,
                            right: 24,
                            background: "#fff",
                            color: "#3B82F6",
                            borderRadius: 12,
                            padding: "0 12px",
                            fontWeight: 600,
                            fontSize: 12,
                          }}
                        >
                          Most Popular
                        </div>
                      )}
                      <Title
                        level={3}
                        style={{
                          color: plan.highlight ? "#fff" : "#3B82F6",
                          fontWeight: 600,
                        }}
                      >
                        {plan.name}
                      </Title>
                      <Paragraph
                        style={{
                          color: plan.highlight ? "#E2E8F0" : "#64748B",
                          fontSize: 14,
                        }}
                      >
                        {plan.desc}
                      </Paragraph>
                      <div style={{ margin: "24px 0" }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 32,
                            color: plan.highlight ? "#fff" : "#3B82F6",
                          }}
                        >
                          {plan.price}
                        </span>
                        <span
                          style={{
                            color: plan.highlight ? "#E2E8F0" : "#64748B",
                            fontSize: 16,
                            marginLeft: 4,
                          }}
                        >
                          {plan.period}
                        </span>
                      </div>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          marginBottom: 24,
                        }}
                      >
                        {plan.features.map((f, i) => (
                          <li
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              color: plan.highlight ? "#fff" : "#64748B",
                              fontSize: 14,
                              marginBottom: 8,
                            }}
                          >
                            <CheckCircleFilled
                              style={{
                                color: plan.highlight ? "#fff" : "#10B981",
                              }}
                            />{" "}
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button
                        type={plan.highlight ? "primary" : "default"}
                        size="large"
                        style={{
                          borderRadius: 8,
                          fontWeight: 600,
                          width: "100%",
                          background: plan.highlight ? "#fff" : "#3B82F6",
                          color: plan.highlight ? "#3B82F6" : "#fff",
                          border: plan.highlight ? "none" : "none",
                        }}
                      >
                        {plan.cta}
                      </Button>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.section>
          {/* FAQ Section */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ background: "#F8FAFC", padding: "100px 0" }}
          >
            <Title
              level={2}
              style={{
                color: "#111827",
                fontWeight: 700,
                fontSize: 32,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Frequently Asked Questions
            </Title>
            <Paragraph
              style={{
                color: "#64748B",
                fontSize: 18,
                textAlign: "center",
                marginBottom: 48,
              }}
            >
              Everything you need to know about ProgressHub
            </Paragraph>
            <Row justify="center">
              <Col xs={24} md={16}>
                {" "}
                <Collapse
                  accordion
                  bordered={false}
                  style={{ background: "transparent" }}
                >
                  {faqs.map((faq, idx) => (
                    <Panel
                      header={
                        <span style={{ fontWeight: 600, fontSize: 16 }}>
                          {faq.q}
                        </span>
                      }
                      key={idx}
                      style={{
                        background: "#fff",
                        borderRadius: 8,
                        marginBottom: 16,
                      }}
                    >
                      <Paragraph style={{ color: "#64748B", fontSize: 16 }}>
                        {faq.a}
                      </Paragraph>
                    </Panel>
                  ))}
                </Collapse>
              </Col>
            </Row>
          </motion.section>
          {/* Final CTA Section */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{
              background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
              padding: "80px 0",
              textAlign: "center",
            }}
          >
            <Title
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 36,
                marginBottom: 16,
              }}
            >
              Ready to get started?
            </Title>
            <Paragraph
              style={{ color: "#E2E8F0", fontSize: 18, marginBottom: 32 }}
            >
              Join thousands of companies who trust ProgressHub to manage their
              projects efficiently
            </Paragraph>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                type="primary"
                size="large"
                style={{
                  borderRadius: 8,
                  fontWeight: 600,
                  height: 56,
                  padding: "0 32px",
                  background: "#fff",
                  color: "#3B82F6",
                  border: "none",
                }}
              >
                Start Free 14-Day Trial <ArrowRightOutlined />
              </Button>
            </motion.div>
          </motion.section>
        </Content>
        <Footer style={{ background: "#1E293B", color: "#fff", padding: 0 }}>
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "80px 80px 40px 80px",
              display: "flex",
              flexWrap: "wrap",
              gap: 80,
            }}
          >
            <div
              style={{
                flex: "0 0 300px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src="/logo.svg"
                  alt="ProgressHub Logo"
                  style={{ width: 32, height: 32 }}
                />
                <span style={{ fontWeight: 700, fontSize: 20, color: "#fff" }}>
                  ProgressHub
                </span>
              </div>
              <Paragraph style={{ color: "#94A3B8", fontSize: 14 }}>
                Smart project progress tracking solution that helps businesses
                optimize workflows and improve efficiency.
              </Paragraph>
            </div>
            <div
              style={{
                flex: "0 0 200px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <Text strong style={{ color: "#fff" }}>
                Product
              </Text>
              <Text style={{ color: "#94A3B8" }}>Features</Text>
              <Text style={{ color: "#94A3B8" }}>Pricing</Text>
              <Text style={{ color: "#94A3B8" }}>API</Text>
              <Text style={{ color: "#94A3B8" }}>Integrations</Text>
            </div>
            <div
              style={{
                flex: "0 0 200px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <Text strong style={{ color: "#fff" }}>
                Support
              </Text>
              <Text style={{ color: "#94A3B8" }}>Help Center</Text>
              <Text style={{ color: "#94A3B8" }}>Contact Us</Text>
              <Text style={{ color: "#94A3B8" }}>Bug Reports</Text>
              <Text style={{ color: "#94A3B8" }}>Community</Text>
            </div>
            <div
              style={{
                flex: "0 0 200px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <Text strong style={{ color: "#fff" }}>
                Company
              </Text>
              <Text style={{ color: "#94A3B8" }}>About</Text>
              <Text style={{ color: "#94A3B8" }}>Privacy Policy</Text>
            </div>
          </div>
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 80px 40px 80px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #334155",
            }}
          >
            <Text style={{ color: "#94A3B8" }}>
              © 2025 ProgressHub. All rights reserved.
            </Text>
          </div>
        </Footer>
      </Layout>
    </div>
  );
};

export default LandingPage;
