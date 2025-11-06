
import { experimental_extendTheme as extendTheme } from '@mui/material/styles';

// Create a theme instance.
const theme = extendTheme({
    colorSchemes: {
        light: {
            palette: {
                primary: {
                    main: '#000000ff',
                    light: '#252f38ff'
                }
            }
        },
        dark: {
            palette: {
                primary: {
                    main: '#ffffffff',
                    light: '#252f38ff'
                }
            }
        },
    },
    colorSchemeSelector: 'class'

    // ...other properties
});
export default theme;