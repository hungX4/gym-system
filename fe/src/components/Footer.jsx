import Button from '@mui/material/Button';
import { Box, Typography, Grid, TextField, Link, Stack } from '@mui/material';
import Container from '@mui/material/Container';
export default function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                mt: 6,
                py: { xs: 4, md: 6 },
                px: { xs: 2, md: 6 },
                bgcolor: 'background.paper',
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            }}
        >
            <Container maxWidth="lg">
                <Grid
                    container
                    spacing={3}
                    alignItems="center"
                    justifyContent="space-between"
                >
                    {/* Left Section */}
                    <Grid
                        item
                        xs={12}
                        md={4}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: { xs: 'flex-start', md: 'flex-start' },
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            HOANG KIM COACH
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', mt: 1 }}>
                            © {new Date().getFullYear()} All rights reserved.
                        </Typography>
                    </Grid>



                    {/* Right Button */}
                    <Grid
                        item
                        xs={12}
                        md={4}
                        sx={{
                            gap: 2,
                            display: 'flex',
                            justifyContent: { xs: 'flex-start', md: 'flex-end' },
                        }}
                    >
                        {/* Center Links */}
                        <Grid
                            item
                            xs={12}
                            md={4}
                            sx={{
                                display: 'flex',
                                justifyContent: { xs: 'flex-start', md: 'center' },
                                gap: 2,
                                flexWrap: 'wrap',
                            }}
                        >
                            <Link href="#" underline="hover">Home</Link>
                            <Link href="#" underline="hover">Privacy</Link>
                            <Link href="#" underline="hover">Contact</Link>
                        </Grid>
                        <Button variant="outlined" size="small">
                            FAQ
                        </Button>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}