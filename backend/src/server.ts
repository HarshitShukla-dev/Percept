import dotenv from 'dotenv';
import app from './app';

dotenv.config();

require('fs').writeFileSync('./credentials/google-credentials.json', process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});