import React from "react";
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
  max-width: 1000px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 2.25rem;
  margin-bottom: 2rem;
  color: var(--text-dark);
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const StoryContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4rem;
  margin-bottom: 4rem;

  @media (max-width: 992px) {
    flex-direction: column;
    gap: 2rem;
  }
`;

const StoryContent = styled.div`
  flex: 1;
`;

const StoryImageContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const StoryImage = styled.div`
  width: 100%;
  max-width: 450px;
  height: 350px;
  background-color: var(--primary-light);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 5rem;

  @media (max-width: 768px) {
    height: 250px;
  }
`;

const Paragraph = styled.p`
  font-size: 1.125rem;
  color: var(--text-light);
  margin-bottom: 1.5rem;
  line-height: 1.8;
`;

const ValueContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ValueCard = styled(motion.div)`
  background-color: white;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const ValueIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
`;

const ValueTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-dark);
`;

const ValueDescription = styled.p`
  color: var(--text-light);
  line-height: 1.6;
`;

const TeamContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const TeamMember = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const TeamMemberImage = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 4rem;
  margin-bottom: 1.5rem;
`;

const TeamMemberName = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-dark);
`;

const TeamMemberRole = styled.p`
  font-size: 1rem;
  color: var(--primary-color);
  font-weight: 500;
  margin-bottom: 1rem;
`;

const TeamMemberBio = styled.p`
  color: var(--text-light);
  line-height: 1.6;
`;

const TimelineContainer = styled.div`
  position: relative;
  max-width: 800px;
  margin: 0 auto;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 4px;
    background-color: var(--primary-light);
    transform: translateX(-50%);

    @media (max-width: 768px) {
      left: 30px;
    }
  }
`;

const TimelineItem = styled(motion.div)`
  position: relative;
  margin-bottom: 3rem;

  &:last-child {
    margin-bottom: 0;
  }

  &:nth-child(odd) {
    padding-right: calc(50% + 2rem);

    @media (max-width: 768px) {
      padding-right: 0;
      padding-left: 70px;
    }
  }

  &:nth-child(even) {
    padding-left: calc(50% + 2rem);

    @media (max-width: 768px) {
      padding-left: 70px;
    }
  }
`;

const TimelineDot = styled.div`
  position: absolute;
  width: 24px;
  height: 24px;
  background-color: var(--primary-color);
  border-radius: 50%;
  top: 0;

  ${(props) =>
    props.right
      ? `
    right: calc(50% - 12px);
    
    @media (max-width: 768px) {
      right: auto;
      left: 18px;
    }
  `
      : `
    left: calc(50% - 12px);
    
    @media (max-width: 768px) {
      left: 18px;
    }
  `}
`;

const TimelineContent = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const TimelineYear = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`;

const TimelineTitle = styled.h3`
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
  color: var(--text-dark);
`;

const TimelineDescription = styled.p`
  font-size: 0.95rem;
  color: var(--text-light);
  line-height: 1.6;
`;

const AboutPage = () => {
  const { ref: storyRef, inView: storyInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const { ref: valuesRef, inView: valuesInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const { ref: teamRef, inView: teamInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const { ref: timelineRef, inView: timelineInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const valueItems = [
    {
      icon: "🤝",
      title: "Respect for Traditions",
      description:
        "We build technology that respects and upholds the 12 Traditions, particularly around anonymity and group autonomy.",
    },
    {
      icon: "🔒",
      title: "Privacy First",
      description:
        "We never compromise on privacy. All features are designed with privacy as the foundation, not an afterthought.",
    },
    {
      icon: "💡",
      title: "Simplicity",
      description:
        "We believe in simplicity of design and function. Recovery tools should make life easier, not more complicated.",
    },
    {
      icon: "🌱",
      title: "Service",
      description:
        "Our work is built on a foundation of service to the recovery community. We are here to help, not to profit.",
    },
    {
      icon: "🔄",
      title: "Continuous Improvement",
      description:
        "We continuously seek user feedback to improve and evolve our platform to better serve recovery communities.",
    },
    {
      icon: "♿",
      title: "Accessibility",
      description:
        "We believe recovery tools should be accessible to everyone, regardless of technical ability or disability.",
    },
  ];

  const teamMembers = [
    {
      initial: "J",
      name: "James Wilson",
      role: "Founder & CEO",
      bio: "James founded Recovery Connect after experiencing firsthand the challenges of managing a 12-step homegroup. With 8 years in recovery and 15 years in software development, he combines these passions to serve the recovery community.",
    },
    {
      initial: "S",
      name: "Sarah Chen",
      role: "Lead Developer",
      bio: "Sarah brings 10 years of mobile app development experience to Recovery Connect. Her expertise in building secure communication platforms ensures our app maintains the highest standards of privacy and security.",
    },
    {
      initial: "M",
      name: "Michael Davis",
      role: "Community Manager",
      bio: "With 12 years in recovery and experience serving at the intergroup level, Michael ensures Recovery Connect stays true to recovery principles while meeting the real needs of recovery groups.",
    },
  ];

  const timelineEvents = [
    {
      year: "2019",
      title: "The Idea Is Born",
      description:
        "After struggling with paper records and disorganized communication as a homegroup treasurer, James envisions a privacy-first digital solution for recovery groups.",
    },
    {
      year: "2020",
      title: "Research & Development",
      description:
        "The founding team interviews dozens of homegroup members across multiple fellowships to understand pain points and requirements.",
    },
    {
      year: "2021",
      title: "First Prototype",
      description:
        "The first version of Recovery Connect is built and tested with a handful of pilot groups, focusing on meeting management and treasury features.",
    },
    {
      year: "2022",
      title: "Official Launch",
      description:
        "Recovery Connect launches publicly with its core feature set. Within months, hundreds of recovery groups have adopted the platform.",
    },
    {
      year: "2023",
      title: "Expansion & Growth",
      description:
        "New features are added based on user feedback. Recovery Connect grows to serve thousands of users across multiple countries and fellowships.",
    },
  ];

  return (
    <PageContainer>
      <HeroSection>
        <HeroContent>
          <PageTitle>Our Story</PageTitle>
          <PageSubtitle>
            Recovery Connect was built by members of the recovery community to
            solve real problems while respecting recovery traditions.
          </PageSubtitle>
        </HeroContent>
      </HeroSection>

      <SectionContainer>
        <SectionContent>
          <StoryContainer
            ref={storyRef}
            as={motion.div}
            initial={{ opacity: 0, y: 30 }}
            animate={storyInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <StoryContent>
              <SectionTitle style={{ textAlign: "left" }}>
                From Challenge to Solution
              </SectionTitle>
              <Paragraph>
                Recovery Connect began with a simple problem: as a treasurer for
                his homegroup, our founder James was frustrated with the
                disorganized system of paper records, email chains, and text
                messages used to manage the group.
              </Paragraph>
              <Paragraph>
                When he became treasurer, he inherited a shoebox of receipts and
                a notebook with financial records. When his service term ended,
                he had to train the next treasurer and ensure a smooth
                transition of records—a process that was unnecessarily complex.
              </Paragraph>
              <Paragraph>
                He realized that while there were many digital tools available
                for businesses, none were designed specifically for 12-step
                recovery groups with their unique needs for anonymity,
                simplicity, and respect for traditions.
              </Paragraph>
              <Paragraph>
                Recovery Connect was created to bridge that gap, providing
                recovery groups with the digital tools they need while
                maintaining the principles and traditions that make these
                communities special.
              </Paragraph>
            </StoryContent>
            <StoryImageContainer>
              <StoryImage>📱</StoryImage>
            </StoryImageContainer>
          </StoryContainer>
        </SectionContent>
      </SectionContainer>

      <SectionContainer alternate>
        <SectionContent>
          <SectionTitle>Our Values</SectionTitle>
          <ValueContainer
            ref={valuesRef}
            as={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate={valuesInView ? "visible" : "hidden"}
          >
            {valueItems.map((value, index) => (
              <ValueCard key={index} variants={fadeInUpVariants}>
                <ValueIcon>{value.icon}</ValueIcon>
                <ValueTitle>{value.title}</ValueTitle>
                <ValueDescription>{value.description}</ValueDescription>
              </ValueCard>
            ))}
          </ValueContainer>
        </SectionContent>
      </SectionContainer>

      <SectionContainer>
        <SectionContent>
          <SectionTitle>Our Team</SectionTitle>
          <TeamContainer
            ref={teamRef}
            as={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate={teamInView ? "visible" : "hidden"}
          >
            {teamMembers.map((member, index) => (
              <TeamMember key={index} variants={fadeInUpVariants}>
                <TeamMemberImage>{member.initial}</TeamMemberImage>
                <TeamMemberName>{member.name}</TeamMemberName>
                <TeamMemberRole>{member.role}</TeamMemberRole>
                <TeamMemberBio>{member.bio}</TeamMemberBio>
              </TeamMember>
            ))}
          </TeamContainer>
        </SectionContent>
      </SectionContainer>

      <SectionContainer alternate>
        <SectionContent>
          <SectionTitle>Our Journey</SectionTitle>
          <TimelineContainer ref={timelineRef} as={motion.div}>
            {timelineEvents.map((event, index) => (
              <TimelineItem
                key={index}
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={
                  timelineInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ delay: index * 0.2, duration: 0.5 }}
              >
                <TimelineDot right={index % 2 === 0} />
                <TimelineContent>
                  <TimelineYear>{event.year}</TimelineYear>
                  <TimelineTitle>{event.title}</TimelineTitle>
                  <TimelineDescription>{event.description}</TimelineDescription>
                </TimelineContent>
              </TimelineItem>
            ))}
          </TimelineContainer>
        </SectionContent>
      </SectionContainer>

      <NewsletterSignup />
    </PageContainer>
  );
};

export default AboutPage;
