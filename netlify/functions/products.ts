import type { Handler, HandlerEvent } from '@netlify/functions';

const handler: Handler = async (event: HandlerEvent) => {
  const res = await fetch('https://vbiwbf-ev.myshopify.com/products.json');
  const text = await res.text();

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: text,
  };
};

export { handler };
