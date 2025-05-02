import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

const PageContainer = styled.div`
  padding: 10rem 1rem 5rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  text-align: center;
  max-width: 700px;
  margin: 0 auto 4rem;
`;

const PageTitle = styled.h1`
  font-size: 3rem;
  color: var(--text-dark);
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.25rem;
  color: var(--text-light);

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const ContactInfo = styled.div``;

const ContactForm = styled.form`
  background-color: white;
  padding: 2.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--text-dark);
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-dark);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: var(--primary-color);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
  min-height: 150px;
  resize: vertical;

  &:focus {
    border-color: var(--primary-color);
  }
`;

const SubmitButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--primary-dark);
  }

  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const InfoCard = styled.div`
  margin-bottom: 2rem;
`;

const InfoTitle = styled.h3`
  font-size: 1.25rem;
  color: var(--text-dark);
  margin-bottom: 1rem;
`;

const InfoText = styled.p`
  color: var(--text-light);
  margin-bottom: 0.5rem;
  line-height: 1.6;
`;

const InfoLink = styled.a`
  color: var(--primary-color);
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const SuccessMessage = styled(motion.div)`
  background-color: var(--success);
  color: white;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-top: 1rem;
  text-align: center;
  font-weight: 500;
`;

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    groupName: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // In a real app, you would send this data to your backend
      console.log("Form submitted:", formData);
      setLoading(false);
      setSubmitted(true);

      // Reset form after submission
      setFormData({
        name: "",
        email: "",
        groupName: "",
        message: "",
      });

      // Hide success message after some time
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    }, 1000);
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Get Started with Homegroups</PageTitle>
        <PageSubtitle>
          We're here to help your recovery group thrive with our tools. Reach
          out to learn more or sign up for a free trial.
        </PageSubtitle>
      </PageHeader>

      <ContentGrid>
        <ContactInfo>
          <InfoCard>
            <InfoTitle>Contact Information</InfoTitle>
            <InfoText>
              We're here to answer any questions you have about Recovery
              Connect.
            </InfoText>
            <InfoText>
              Email:{" "}
              <InfoLink href="mailto:info@recoveryconnect.app">
                info@recoveryconnect.app
              </InfoLink>
            </InfoText>
            <InfoText>
              Phone: <InfoLink href="tel:+1234567890">(123) 456-7890</InfoLink>
            </InfoText>
          </InfoCard>

          <InfoCard>
            <InfoTitle>Office Hours</InfoTitle>
            <InfoText>Monday - Friday: 9:00 AM - 5:00 PM EST</InfoText>
            <InfoText>Saturday - Sunday: Closed</InfoText>
          </InfoCard>

          <InfoCard>
            <InfoTitle>Need Help?</InfoTitle>
            <InfoText>
              Check out our <InfoLink href="/faq">FAQ</InfoLink> for quick
              answers or schedule a <InfoLink href="/demo">free demo</InfoLink>{" "}
              to see the app in action.
            </InfoText>
          </InfoCard>
        </ContactInfo>

        <ContactForm onSubmit={handleSubmit}>
          <FormTitle>Start Your Free Trial</FormTitle>

          <FormGroup>
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="groupName">Group Name (Optional)</Label>
            <Input
              type="text"
              id="groupName"
              name="groupName"
              value={formData.groupName}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="message">Message</Label>
            <TextArea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? "Sending..." : "Get Started"}
          </SubmitButton>

          {submitted && (
            <SuccessMessage
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              Thank you for reaching out! We'll be in touch soon.
            </SuccessMessage>
          )}
        </ContactForm>
      </ContentGrid>
    </PageContainer>
  );
};

export default ContactPage;
