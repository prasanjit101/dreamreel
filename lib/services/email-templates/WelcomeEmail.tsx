import { Logo } from '@/components/block/Logo';
import { Html, Head, Body, Container, Section, Heading, Text, Button } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

interface WelcomeEmailProps {
    name: string;
}

export const WelcomeEmail = ({ name }: WelcomeEmailProps) => (
    <Html>
        <Head />
        <Tailwind>
            <Body className="bg-white font-sans">
                <Container className="mx-auto p-4 max-w-2xl">
                    <Section className="text-center mb-6">
                        <Logo />
                    </Section>

                    <Section className="mb-6">
                        <Heading className="text-2xl font-bold text-gray-900 mb-4">
                            Welcome to Dailycast, {name}!
                        </Heading>
                        <Text className="text-gray-700 mb-4">
                            I&apos;m Jit, the creator of Dailycast. We&apos;re thrilled to have you join Dailycast. Dailycast is here to help you stay updated with all your industry insights.
                        </Text>
                        <Text className="text-gray-700 mb-6">
                            To get started, sign up and save your preferences to start receiving email updates. If you have any questions or need assistance, please don&apos;t hesitate to reach out.
                        </Text>
                    </Section>

                    <Section className="text-center">
                        <Button
                            href="https://calendly.com/rely-prasanjit/30min"
                            className="bg-blue-600 text-white font-medium py-2 px-6 rounded-0"
                        >
                            Book a Call
                        </Button>
                    </Section>
                </Container>
            </Body>
        </Tailwind>
    </Html>
);

export default WelcomeEmail;
