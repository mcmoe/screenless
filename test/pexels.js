import 'dotenv-expand/config';
import { createClient } from 'pexels';

const client = createClient(process.env.API_KEY_PEXELS);
const query = 'dog';

const photo = await client.photos.search({ query, per_page: 1 }).then(photos => {
    if(photos.total_results > 0) {
        return photos.photos[0].src.medium;
    }
});

// const photo = await client.photos.show({id: 45718}).then(photo => photo ? photo.src.medium : '');
console.log(photo);
