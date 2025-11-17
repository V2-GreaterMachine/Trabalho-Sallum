document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById("recomendacoes"); 
  const abrirBtn = document.getElementById("recomendar"); 
  const fecharBtn = document.getElementById("fecharRecomendacao"); 
  const enviarBtn = document.getElementById("enviarRecomendacao"); 

  if (!modal || !abrirBtn || !fecharBtn || !enviarBtn) {
    console.warn("Algum elemento do modal não foi encontrado. Verifique IDs: recomendacoes, recomendar, fecharRecomendacao, enviarRecomendacao");
    return;
  }

  
  abrirBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
  });

  
  fecharBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  
  function criarCardDOM(categoria, texto, imagemSrc) {
    const card = document.createElement('div');
    card.className = 'card'; 

    
    const tag = document.createElement('span');
    tag.className = 'categoria';
    tag.textContent = categoria.toUpperCase();
    tag.style.fontSize = '12px';
    tag.style.fontWeight = '700';
    tag.style.padding = '4px 8px';
    tag.style.borderRadius = '6px';
    tag.style.background = '#2ebd8b';
    tag.style.color = '#fff';
    tag.style.alignSelf = 'flex-start';
    card.appendChild(tag);

   
    if (imagemSrc) {
      const img = document.createElement('img');
      img.alt = categoria + ' imagem';
      img.style.width = '110px';
      img.style.height = '110px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '8px';
      img.style.margin = '10px 0';
      img.src = imagemSrc;
      card.appendChild(img);
    }

    
    const p = document.createElement('p');
    p.className = 'texto';
    p.textContent = texto;
    p.style.fontSize = '14px';
    p.style.textAlign = 'center';
    card.appendChild(p);

   
    const info = document.createElement('p');
    info.className = 'info';
    const now = new Date();
    info.textContent = now.toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
    info.style.fontSize = '12px';
    info.style.color = '#666';
    info.style.marginTop = '8px';
    card.appendChild(info);

    return card;
  }

 
  const destinos = {
    jogo: document.getElementById('feed-jogos'),
    livro: document.getElementById('feed-livros'),
    filme: document.getElementById('feed-filmes'),
    musica: document.getElementById('feed-musicas')
  };

  enviarBtn.addEventListener('click', () => {
    const categoria = document.getElementById('tipoPost')?.value || 'jogo';
    const texto = (document.getElementById('textoPost')?.value || '').trim();
    const inputImg = document.getElementById('imagemPost');

    if (!texto) {
      alert('Escreva a recomendação antes de enviar.');
      return;
    }

    const destino = destinos[categoria];
    if (!destino) {
      alert('Categoria inválida. Verifique o campo de seleção.');
      return;
    }

    
    const file = inputImg?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target.result;
        const card = criarCardDOM(categoria, texto, src);
        destino.appendChild(card);
       
        card.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      };
      reader.onerror = () => {
        console.error('Erro ao ler a imagem.');
        const card = criarCardDOM(categoria, texto, null);
        destino.appendChild(card);
      };
      reader.readAsDataURL(file);
    } else {
      
      const card = criarCardDOM(categoria, texto, null);
      destino.appendChild(card);
      card.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }

    
    document.getElementById('textoPost').value = '';
    if (inputImg) inputImg.value = '';
    document.getElementById('tipoPost').value = 'jogo';
    modal.style.display = 'none';
  });
});

document.querySelectorAll('.carrossel-wrapper').forEach(wrapper => {
  const carrossel = wrapper.querySelector('.carrossel');
  const btnLeft = wrapper.querySelector('.scroll-btn.left');
  const btnRight = wrapper.querySelector('.scroll-btn.right');

  btnLeft.addEventListener('click', () => {
    carrossel.scrollBy({ left: -250, behavior: 'smooth' });
  });

  btnRight.addEventListener('click', () => {
    carrossel.scrollBy({ left: 250, behavior: 'smooth' });
  });
});