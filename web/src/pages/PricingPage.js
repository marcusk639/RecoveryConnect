import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import NewsletterSignup from "../components/NewsletterSignup";

const PageContainer = styled.div`
  padding-top: 70px;
`;

const HeroSection = styled.section`
  background: linear-gradient(
    135deg,
    var(--primary-light) 0%,
    var(--primary-color) 100%
  );
  padding: 6rem 1rem 4rem;
  color: white;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const SectionContainer = styled.section`
  padding: 5rem 1rem;
  background-color: ${(props) =>
    props.alternate ? "var(--background-alt)" : "var(--background)"};
`;

const SectionContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 2.25rem;
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-dark);

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const SectionDescription = styled.p`
  text-align: center;
  max-width: 800px;
  margin: 0 auto 3rem;
  font-size: 1.125rem;
  color: var(--text-light);
`;

const PricingContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;

  @media (max-width: 992px) {
    flex-direction: column;
    align-items: center;
  }
`;

const PricingCard = styled(motion.div)`
  background-color: white;
  border-radius: 0.5rem;
  padding: 3rem 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  border: ${(props) =>
    props.featured ? "2px solid var(--primary-color)" : "1px solid #e2e8f0"};
  position: relative;
  overflow: hidden;

  @media (max-width: 992px) {
    max-width: 500px;
  }
`;

const FeatureTag = styled.div`
  position: absolute;
  top: 1.5rem;
  right: -3rem;
  background-color: var(--primary-color);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 3rem;
  transform: rotate(45deg);
`;

const PricingTitle = styled.h3`
  font-size: 1.75rem;
  color: var(--text-dark);
  margin-bottom: 1rem;
  font-weight: 700;
`;

const PricingPrice = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 0.5rem;

  span {
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-light);
  }
`;

const PricingBilled = styled.div`
  font-size: 0.95rem;
  color: var(--text-light);
  margin-bottom: 2rem;
`;

const PricingDescription = styled.p`
  color: var(--text-light);
  margin-bottom: 2rem;
  font-size: 0.95rem;
  line-height: 1.6;
`;

const FeatureList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0 0 2rem;
  flex-grow: 1;
`;

const FeatureItem = styled.li`
  margin-bottom: 0.75rem;
  display: flex;
  align-items: flex-start;
  font-size: 1rem;

  &:before {
    content: "✓";
    margin-right: 0.75rem;
    color: var(--success);
    font-weight: bold;
  }
`;

const PricingButton = styled(Link)`
  background-color: ${(props) =>
    props.primary ? "var(--primary-color)" : "transparent"};
  color: ${(props) => (props.primary ? "white" : "var(--primary-color)")};
  border: ${(props) =>
    props.primary ? "none" : "2px solid var(--primary-color)"};
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
  margin-top: auto;

  &:hover {
    background-color: ${(props) =>
      props.primary ? "var(--primary-dark)" : "var(--primary-light)"};
    text-decoration: none;
  }
`;

const FAQContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const FAQItem = styled(motion.div)`
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`;

const FAQQuestion = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: var(--text-dark);
`;

const FAQAnswer = styled.p`
  font-size: 1rem;
  color: var(--text-light);
  line-height: 1.6;
`;

const ComparisonContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const ComparisonTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 0 auto;
  font-size: 0.95rem;
`;

const TableHead = styled.thead`
  background-color: var(--primary-color);
  color: white;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: ${(props) =>
      props.header ? "transparent" : "rgba(195, 218, 254, 0.2)"};
  }
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: ${(props) => props.align || "left"};
  border-bottom: 1px solid #e2e8f0;
`;

const TableCell = styled.td`
  padding: 1rem;
  text-align: ${(props) => props.align || "left"};
  border-bottom: 1px solid #e2e8f0;

  // For checkmarks
  &.check {
    color: var(--success);
    font-weight: bold;
    text-align: center;
  }

  &.empty {
    color: var(--text-light);
    text-align: center;
  }
`;

const FeatureCategory = styled.td`
  font-weight: 600;
  padding: 1rem;
  background-color: var(--background-alt);
  color: var(--text-dark);
  border-bottom: 1px solid #e2e8f0;
`;

const EnterpriseContainer = styled.div`
  background: linear-gradient(
    to right,
    var(--primary-dark),
    var(--primary-color)
  );
  border-radius: 0.5rem;
  padding: 3rem 2rem;
  color: white;
  text-align: center;
  max-width: 900px;
  margin: 4rem auto 0;
`;

const EnterpriseTitle = styled.h3`
  font-size: 1.75rem;
  margin-bottom: 1rem;
`;

const EnterpriseDescription = styled.p`
  font-size: 1.125rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const EnterpriseButton = styled(Link)`
  background-color: white;
  color: var(--primary-color);
  padding: 1rem 2rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 1.125rem;
  transition: all 0.3s ease;
  display: inline-block;

  &:hover {
    background-color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
  }
`;

const PricingPage = () => {
  const { ref: pricingRef, inView: pricingInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: faqRef, inView: faqInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: tableRef, inView: tableInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: enterpriseRef, inView: enterpriseInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  const faqVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
  };

  const tableVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const faqItems = [
    {
      question: "How is the premium plan billed?",
      answer:
        "The premium plan is billed annually at $12 per year, which works out to $1 per month. We offer annual billing to keep administrative costs low, allowing us to provide our service at an affordable price.",
    },
    {
      question: "Can I switch between plans?",
      answer:
        "Yes, you can upgrade to the premium plan at any time. When you upgrade, you'll gain immediate access to all premium features. If you need to downgrade, you can do so when your current billing period ends.",
    },
    {
      question: "Is there a trial period for the premium plan?",
      answer:
        "Yes, we offer a 30-day free trial of our premium plan so you can experience all the features before committing. No credit card is required to start the trial.",
    },
    {
      question: "How many group members can I have on each plan?",
      answer:
        "The free plan allows up to 20 members in your group. The premium plan removes this limit, allowing unlimited members in your recovery group.",
    },
    {
      question: "Do you offer discounts for multiple groups?",
      answer:
        "Yes, if you're managing multiple recovery groups, please contact us for information about our multi-group discount pricing.",
    },
  ];

  return (
    <PageContainer>
      <HeroSection>
        <HeroContent>
          <PageTitle>Simple, Affordable Pricing</PageTitle>
          <PageSubtitle>
            Recovery Connect is designed to be accessible for all recovery
            groups, with a focus on providing value while respecting the
            financial traditions of 12-step programs.
          </PageSubtitle>
        </HeroContent>
      </HeroSection>

      <SectionContainer>
        <SectionContent>
          <SectionTitle>Choose the Right Plan for Your Group</SectionTitle>
          <SectionDescription>
            Whether you're an individual looking for meetings or a group
            treasurer managing finances, we have a plan that fits your needs.
          </SectionDescription>

          <PricingContainer ref={pricingRef} as={motion.div}>
            <PricingCard
              as={motion.div}
              custom={0}
              variants={cardVariants}
              initial="hidden"
              animate={pricingInView ? "visible" : "hidden"}
            >
              <PricingTitle>Free</PricingTitle>
              <PricingPrice>
                $0 <span>per month</span>
              </PricingPrice>
              <PricingBilled>Always free</PricingBilled>
              <PricingDescription>
                For individuals seeking recovery meetings and basic group
                features.
              </PricingDescription>

              <FeatureList>
                <FeatureItem>Find and save meetings</FeatureItem>
                <FeatureItem>Personal meeting schedule</FeatureItem>
                <FeatureItem>View group announcements</FeatureItem>
                <FeatureItem>Basic member profiles</FeatureItem>
                <FeatureItem>End-to-end encrypted messages</FeatureItem>
                <FeatureItem>Up to 20 group members</FeatureItem>
                <FeatureItem>Limited treasury features</FeatureItem>
              </FeatureList>

              <PricingButton to="/contact">Get Started</PricingButton>
            </PricingCard>

            <PricingCard
              featured
              as={motion.div}
              custom={1}
              variants={cardVariants}
              initial="hidden"
              animate={pricingInView ? "visible" : "hidden"}
            >
              <FeatureTag>MOST POPULAR</FeatureTag>
              <PricingTitle>Premium</PricingTitle>
              <PricingPrice>
                $1 <span>per month</span>
              </PricingPrice>
              <PricingBilled>Billed annually at $12</PricingBilled>
              <PricingDescription>
                For recovery groups who need additional management features.
              </PricingDescription>

              <FeatureList>
                <FeatureItem>All Free features</FeatureItem>
                <FeatureItem>Complete treasury management</FeatureItem>
                <FeatureItem>Business meeting tools</FeatureItem>
                <FeatureItem>Financial reports</FeatureItem>
                <FeatureItem>Service commitment tracking</FeatureItem>
                <FeatureItem>Unlimited group members</FeatureItem>
                <FeatureItem>Celebration notifications</FeatureItem>
                <FeatureItem>Group analytics</FeatureItem>
                <FeatureItem>Priority support</FeatureItem>
              </FeatureList>

              <PricingButton to="/contact" primary>
                Get Started
              </PricingButton>
            </PricingCard>
          </PricingContainer>
        </SectionContent>
      </SectionContainer>

      <SectionContainer alternate>
        <SectionContent>
          <SectionTitle>Feature Comparison</SectionTitle>
          <SectionDescription>
            See all the features included in each plan to make the best decision
            for your recovery group.
          </SectionDescription>

          <ComparisonContainer
            ref={tableRef}
            as={motion.div}
            variants={tableVariants}
            initial="hidden"
            animate={tableInView ? "visible" : "hidden"}
          >
            <ComparisonTable>
              <TableHead>
                <TableRow header>
                  <TableHeader>Feature</TableHeader>
                  <TableHeader align="center">Free</TableHeader>
                  <TableHeader align="center">Premium</TableHeader>
                </TableRow>
              </TableHead>
              <tbody>
                <TableRow>
                  <FeatureCategory colSpan="3">
                    Meeting Features
                  </FeatureCategory>
                </TableRow>
                <TableRow>
                  <TableCell>Meeting finder</TableCell>
                  <TableCell className="check">✓</TableCell>
                  <TableCell className="check">✓</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Save favorite meetings</TableCell>
                  <TableCell className="check">✓</TableCell>
                  <TableCell className="check">✓</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Offline meeting access</TableCell>
                  <TableCell className="check">✓</TableCell>
                  <TableCell className="check">✓</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Meeting reminders</TableCell>
                  <TableCell className="check">✓</TableCell>
                  <TableCell className="check">✓</TableCell>
                </TableRow>

                <TableRow>
                  <FeatureCategory colSpan="3">Group Features</FeatureCategory>
                </TableRow>
                <TableRow>
                  <TableCell>Group membership</TableCell>
                  <TableCell className="check">Up to 20</TableCell>
                  <TableCell className="check">Unlimited</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Group announcements</TableCell>
                  <TableCell className="check">✓</TableCell>
                  <TableCell className="check">✓</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Member profiles</TableCell>
                  <TableCell className="check">Basic</TableCell>
                  <TableCell className="check">Advanced</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Celebration notifications</TableCell>
                  <TableCell className="empty">—</TableCell>
                  <TableCell className="check">✓</TableCell>
                </TableRow>

                <TableRow>
                  <FeatureCategory colSpan="3">
                    Treasury Management
                  </FeatureCategory>
                </TableRow>
                <TableRow>
                  <TableCell>Basic income/expense tracking</TableCell>
                  <TableCell className="check">✓</TableCell>
                  <TableCell className="check">✓</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Detailed financial categorization</TableCell>
                  <TableCell className="empty">—</TableCell>
                  <TableCell className="check">✓</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Financial reports</TableCell>
                  <TableCell className="empty">—</TableCell>
                  <TableCell className="check">✓</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Treasurer transition tools</TableCell>
                  <TableCell className="empty">—</TableCell>
                  <TableCell className="check">✓</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Prudent reserve monitoring</TableCell>
                  <TableCell className="empty">—</TableCell>
                  <TableCell className="check">✓</TableCell>
                </TableRow>

                <TableRow>
                  <FeatureCategory colSpan="3">
                    Additional Features
                  </FeatureCategory>
                </TableRow>
                <TableRow>
                  <TableCell>End-to-end encrypted messaging</TableCell>
                  <TableCell className="check">✓</TableCell>
                  <TableCell className="check">✓</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Business meeting tools</TableCell>
                  <TableCell className="empty">—</TableCell>
                  <TableCell className="check">✓</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Service commitment tracking</TableCell>
                  <TableCell className="empty">—</TableCell>
                  <TableCell className="check">✓</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Group analytics</TableCell>
                  <TableCell className="empty">—</TableCell>
                  <TableCell className="check">✓</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Priority support</TableCell>
                  <TableCell className="empty">—</TableCell>
                  <TableCell className="check">✓</TableCell>
                </TableRow>
              </tbody>
            </ComparisonTable>
          </ComparisonContainer>

          <EnterpriseContainer
            ref={enterpriseRef}
            as={motion.div}
            initial={{ opacity: 0, y: 30 }}
            animate={
              enterpriseInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
            }
            transition={{ duration: 0.6 }}
          >
            <EnterpriseTitle>Need a Custom Solution?</EnterpriseTitle>
            <EnterpriseDescription>
              For intergroups, areas, or regions with multiple recovery groups,
              we offer custom solutions to fit your specific needs.
            </EnterpriseDescription>
            <EnterpriseButton to="/contact">
              Contact Us for Custom Pricing
            </EnterpriseButton>
          </EnterpriseContainer>
        </SectionContent>
      </SectionContainer>

      <SectionContainer>
        <SectionContent>
          <SectionTitle>Frequently Asked Questions</SectionTitle>
          <FAQContainer ref={faqRef} as={motion.div}>
            {faqItems.map((item, index) => (
              <FAQItem
                key={index}
                as={motion.div}
                custom={index}
                variants={faqVariants}
                initial="hidden"
                animate={faqInView ? "visible" : "hidden"}
              >
                <FAQQuestion>{item.question}</FAQQuestion>
                <FAQAnswer>{item.answer}</FAQAnswer>
              </FAQItem>
            ))}
          </FAQContainer>
        </SectionContent>
      </SectionContainer>

      <NewsletterSignup />
    </PageContainer>
  );
};

export default PricingPage;
