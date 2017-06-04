import axios from 'axios';
import Telegraf from 'telegraf';
import uuid from 'uuid/v4';

const app = new Telegraf(process.env.BOT_TOKEN);

app.on('inline_query', async (ctx) =>  {
	const { data } = await axios.get('https://stavklass.ru/images/autocomplete.json', {
		params: { term: ctx.update.inline_query.query }
	});

	let images = await Promise.all(data.map(text => axios.get('https://stavklass.ru/images/search', {
		params: { utf8: '✓', 'image[text]': text  }
	})));

	images = images.map(i => {
		const groups = i.data.match(/data\-clipboard\-text=\"((.*?)\.(jp?g|png|gif))\"/);
		return groups ? groups[1] : false;
	});

	return ctx.answerInlineQuery(data.map((text, idx) => ({
		type: 'photo',
		title: text,
		thumb_url: images[idx],
		photo_url:  images[idx],
		id: idx.toString(),
	})).filter(res => !!res.photo_url));
})

app.startPolling();