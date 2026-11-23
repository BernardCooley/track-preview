import { Box, Flex, Link, Text } from "@chakra-ui/react";
import BackHeader from "@/components/BackHeader";

const sections = [
    {
        id: "privacy",
        title: "Privacy Policy",
        lastUpdated: "18 November 2026",
        content: [
            {
                heading: "Information we collect",
                body: "When you create an account, we collect your email address and a unique user identifier. If you use the app without registering, we create an anonymous identifier. We also store your music preferences (liked tracks, library, genre and year filters) and your display settings (theme, curated mode).",
            },
            {
                heading: "How we use your information",
                body: "Your information is used solely to provide and improve the Phoniquest service: to authenticate your account, save your music library, and personalise your discovery experience. We do not sell, rent, or share your personal data with third parties for marketing purposes.",
            },
            {
                heading: "Third-party services",
                body: "Phoniquest uses Firebase (Google) for authentication and Spotify, Deezer, and iTunes APIs to provide track previews and purchase links. These services may collect data according to their own privacy policies. We encourage you to review their policies directly.",
            },
            {
                heading: "Data storage and security",
                body: "Your data is stored securely using industry-standard encryption and access controls. We retain your data for as long as your account is active. You can request deletion of your account and associated data at any time by contacting us.",
            },
            {
                heading: "Cookies",
                body: "We use essential cookies and local storage for authentication and to remember your preferences (such as theme). We do not use tracking or advertising cookies.",
            },
            {
                heading: "Your rights",
                body: "You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at info@phoniquest.com.",
            },
        ],
    },
    {
        id: "terms",
        title: "Terms of Service",
        lastUpdated: "18 November 2026",
        content: [
            {
                heading: "The service",
                body: "Phoniquest is a music discovery platform that plays short preview clips sourced from third-party APIs (Spotify, Deezer, iTunes). We do not host, store, or distribute music files. All audio previews are provided by and subject to the terms of their respective platforms.",
            },
            {
                heading: "Your account",
                body: "You may use Phoniquest anonymously or create a registered account. You are responsible for maintaining the security of your account credentials. We reserve the right to suspend or terminate accounts that violate these terms.",
            },
            {
                heading: "Acceptable use",
                body: "You agree to use Phoniquest for personal, non-commercial music discovery only. You may not attempt to download, record, or redistribute audio previews played through the service.",
            },
            {
                heading: "Purchase links",
                body: "Phoniquest provides links to external platforms where you can purchase tracks. These transactions occur entirely on third-party sites. We are not a party to those transactions and accept no responsibility for their terms, pricing, or fulfilment.",
            },
            {
                heading: "Content availability",
                body: "Track previews depend on third-party API availability and may be removed or become unavailable at any time without notice. We do not guarantee that any specific track or preview will remain accessible.",
            },
            {
                heading: "Limitation of liability",
                body: "Phoniquest is provided \"as is\" without warranties of any kind. To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.",
            },
            {
                heading: "Changes to these terms",
                body: "We may update these terms from time to time. Continued use of Phoniquest after changes are posted constitutes acceptance of the revised terms.",
            },
            {
                heading: "Contact",
                body: "For questions about these terms or your privacy, email us at info@phoniquest.com.",
            },
        ],
    },
];

const Legal = () => {
    return (
        <Flex direction="column" minH="100dvh" bg="brand.bg">
            <BackHeader title="Legal" />

            <Flex
                flex={1}
                direction="column"
                alignItems="center"
                px={[4, 6]}
                py={[6, 8]}
            >
                <Box w="full" maxW="520px">
                    <Flex gap={3} mb={6}>
                        {sections.map((section) => (
                            <Link
                                key={section.id}
                                href={`#${section.id}`}
                                px={3}
                                py={1.5}
                                rounded="full"
                                bg="brand.primarySubtle"
                                color="brand.primary"
                                fontSize="sm"
                                fontWeight="medium"
                                cursor="pointer"
                                transition="all 0.2s ease"
                                _hover={{
                                    bg: "brand.primary",
                                    color: "white",
                                    textDecoration: "none",
                                }}
                            >
                                {section.title}
                            </Link>
                        ))}
                    </Flex>

                    <Flex direction="column" gap={10}>
                        {sections.map((section) => (
                            <Box key={section.id} id={section.id}>
                                <Text
                                    fontSize="lg"
                                    fontWeight="semibold"
                                    color="brand.textPrimary"
                                    mb={1}
                                >
                                    {section.title}
                                </Text>
                                <Text
                                    fontSize="xs"
                                    color="brand.textMuted"
                                    mb={5}
                                >
                                    Last updated: {section.lastUpdated}
                                </Text>

                                <Flex direction="column" gap={4}>
                                    {section.content.map((item) => (
                                        <Box
                                            key={item.heading}
                                            p={4}
                                            rounded="lg"
                                            bg="brand.cardBg"
                                            border="1px solid"
                                            borderColor="brand.border"
                                        >
                                            <Text
                                                fontSize="md"
                                                fontWeight="semibold"
                                                color="brand.textPrimary"
                                                mb={1}
                                            >
                                                {item.heading}
                                            </Text>
                                            <Text
                                                fontSize="sm"
                                                color="brand.textSecondary"
                                                lineHeight="tall"
                                            >
                                                {item.body}
                                            </Text>
                                        </Box>
                                    ))}
                                </Flex>
                            </Box>
                        ))}
                    </Flex>
                </Box>
            </Flex>
        </Flex>
    );
};

export default Legal;
