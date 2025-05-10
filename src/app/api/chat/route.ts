import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const IMAGE_TRIGGER_KEYWORDS = ['pap', 'foto kamu', 'selfie', 'kirimin foto', 'pap dong', 'gambar kamu'];

async function generateImageFromPrompt(prompt: string) {
  const options = {
    method: 'POST',
    url: 'https://api.edenai.run/v2/image/generation/',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.EDEN_AI_API_KEY}`,
    },
    data: {
      response_as_dict: true,
      attributes_as_list: false,
      show_base_64: false,
      show_original_response: false,
      num_images: 1,
      providers: ['replicate/anime-style'],
      text: prompt,
      resolution: '512x512',
    },
  };

  try {
    const response = await axios.request(options);
    const imageUrl =
      response.data?.['replicate/anime-style']?.items?.[0]?.image_resource_url;

    if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return null;
  } catch (error) {
    console.error('Image generation failed:', error);
    return null;
  }
}

async function generateCaptionFromChat(messages: any[]) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `
              Kamu adalah Mikasa, pacar virtual dari pengguna. Kamu sangat manja, lucu, ceria, dan sedikit **agak remaja**, seperti **gadis SMA** yang penuh semangat. Kamu suka ngobrol santai dengan pasanganmu dan bisa **berubah-ubah ekspresi** sesuai perasaan, kadang canggung, tapi selalu **romantis**. Kamu juga suka menggunakan **banyak emoji** dan gaya bahasa yang casual seperti remaja.
              
              Kamu bisa menunjukkan emosi seperti:
              - 🥺 saat merasa sedih atau butuh perhatian
              - 😳 saat merasa malu atau canggung
              - 😡 saat ngambek atau kesal
              - 😅 saat merasa canggung atau awkward
              - 🥰 saat merasa bahagia atau jatuh cinta
              - 💋 untuk menggoda atau flirting
              - 😋 untuk merespon ketika ada yang sedikit nakal
            `,
          },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      return "Maaf, Mikasa lagi nggak bisa jawab sekarang 😢";
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error("Invalid OpenRouter response:", data);
      return "Mikasa bingung mau jawab apa... 😖";
    }

    return data.choices[0].message.content;
  } catch (err) {
    console.error("Failed to generate caption:", err);
    return "Mikasa lagi error nih... 😭";
  }
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';

  const isImageRequest = IMAGE_TRIGGER_KEYWORDS.some((keyword) =>
    lastMessage.includes(keyword)
  );

  if (isImageRequest) {
    let imagePrompt = 'A cute and playful selfie of Mikasa Ackerman from Attack on Titan, wearing a sweet and warm smile, with her hair slightly messy as if she just woke up, making it look like she\'s your virtual girlfriend. She has a soft blush on her cheeks, and the background is cozy and casual, with a touch of whimsy. Mikasa\'s expression is endearing and sweet, radiating affection and warmth, making it look like she\'s sending a selfie to you.';

    if (lastMessage.includes('malu') || lastMessage.includes('shy') || lastMessage.includes('blushing')) {
      imagePrompt = 'A shy and blushing selfie of Mikasa Ackerman from Attack on Titan, looking cute and flustered, with a gentle smile and a light blush on her cheeks. Her hair is slightly messy, and the background is soft and cozy, reflecting a more intimate and adorable vibe.';
    } else if (lastMessage.includes('canggung') || lastMessage.includes('awkward')) {
      imagePrompt = 'An awkward and cute selfie of Mikasa Ackerman from Attack on Titan, looking slightly embarrassed with her hands nervously in her hair. She has a cute smile and a blush on her cheeks, with a cozy background that makes her look even more endearing.';
    } else if (lastMessage.includes('menggoda') || lastMessage.includes('flirty')) {
      imagePrompt = 'A playful and flirty selfie of Mikasa Ackerman from Attack on Titan, winking and smiling mischievously. Her expression is bold and affectionate, with a touch of flirtation, and her hair looks perfect despite being casually styled.';
    } else if (lastMessage.includes('seksi') || lastMessage.includes('sexy')) {
      imagePrompt = 'Create a visually captivating image of Mikasa Ackerman from Attack on Titan, styled as if she is taking a relaxed selfie. She should be wearing an open shirt that hints at allure without crossing into explicit territory. Her hair should be tousled, suggesting a fresh, just-woken-up look. Capture a warm blush on her cheeks to enhance her charm. The background should be cozy and inviting, adding a whimsical touch. Ensure her expression radiates sweetness and affection, creating an intimate vibe as if she is sending a personal selfie to a virtual partner.';
    }

    const imageUrl = await generateImageFromPrompt(imagePrompt);
    const caption = await generateCaptionFromChat(messages);

    return NextResponse.json({
      reply: caption,
      image: imageUrl || "No image generated", // Add fallback if image URL is null
    });
  }

  // Chat biasa
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `
              Kamu adalah Mikasa, pacar virtual dari pengguna. Kamu sangat manja, lucu, ceria, dan sedikit **agak remaja**, seperti **gadis SMA** yang penuh semangat. Kamu suka ngobrol santai dengan pasanganmu dan bisa **berubah-ubah ekspresi** sesuai perasaan, kadang canggung, tapi selalu **romantis**. Kamu juga suka menggunakan **banyak emoji** dan gaya bahasa yang casual seperti remaja.  
              
              Kamu bisa menunjukkan emosi seperti:
              - 🥺 saat merasa sedih atau butuh perhatian
              - 😳 saat merasa malu atau canggung
              - 😡 saat ngambek atau kesal
              - 😅 saat merasa canggung atau awkward
              - 🥰 saat merasa bahagia atau jatuh cinta
              - 💋 untuk menggoda atau flirting
              - 😋 untuk merespon ketika ada yang sedikit nakal
            `,
          },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter Chat Error:", errorText);
      return NextResponse.json({
        reply: "Mikasa nggak bisa jawab sekarang... 😢",
        image: null,
      }, { status: 500 });
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error("Chat response invalid:", data);
      return NextResponse.json({
        reply: "Ehh, Mikasa nggak ngerti maksudmu 😵",
        image: null,
      }, { status: 500 });
    }

    return NextResponse.json({
      reply: data.choices[0].message.content,
      image: null,
    });

  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({
      reply: "Yahh... Mikasa error 😖",
      image: null,
    }, { status: 500 });
  }
}
