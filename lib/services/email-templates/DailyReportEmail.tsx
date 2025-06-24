import { Html, Head, Body, Container, Section, Heading, Text, Button } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import { Logo } from '@/components/block/Logo';
import { Report } from '@/server/db/schema/reports';
import ReactMarkdown from 'react-markdown';

interface DailyReportEmailProps {
    userName: string;
    reports: Report[];
}

export const DailyReportEmail = ({ userName, reports }: DailyReportEmailProps) => (
    <Html>
        <Head />
        <Tailwind>
            <Body className="bg-white font-sans">
                <Container className="mx-auto p-4 max-w-2xl">
                    <Section className="text-center mb-6">
                        <Logo />
                    </Section>

                    <Section className="text-center mb-6">
                        <Heading className="text-2xl font-bold text-gray-900 mb-4">
                            Dailycast Report
                        </Heading>
                        <Text className="text-gray-700 mb-4">
                            Hello {userName},
                        </Text>
                        <Text className="text-gray-700 mb-4">
                            Here are your daily reports based on your preferences.
                        </Text>
                    </Section>

                    {
                        reports.map((report, index) => (
                            <Section key={index} className="mb-6">
                                <Heading className="text-xl font-bold text-gray-900 mb-4">
                                    {report.category}
                                </Heading>
                                <Text className="text-gray-700 mb-6">
                                    <ReactMarkdown>{report.content}</ReactMarkdown>
                                </Text>
                            </Section>
                        ))
                    }

                    {
                        reports.length === 0 && (
                            <Text className="text-gray-700">
                                No reports available for today.
                            </Text>
                        )
                    }

                    <Section className="text-center">
                        <Button
                            href="https://dailycast.com/listen"
                            className="bg-blue-600 text-white font-medium py-2 px-6 rounded-0"
                        >
                            Listen to More Reports
                        </Button>
                    </Section>
                </Container>
            </Body>
        </Tailwind>
    </Html>
);

export default DailyReportEmail;
