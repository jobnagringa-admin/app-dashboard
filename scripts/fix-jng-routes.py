#!/usr/bin/env python3
"""
Fix broken /jng/ routes by mapping them to correct paths.
"""

import re
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src" / "pages"

# Map old /jng/ routes to new routes
ROUTE_MAP = {
    # Modules
    "/jng/modulo/dev-interviews": "/modulo/dev-interviews",
    "/jng/modulo/conteudo": "/modulo/conteudo",
    "/jng/modulo/empresas": "/modulo/empresas",
    "/jng/modulo/networking": "/modulo/networking",
    
    # Lessons - check if they exist in aulas or jng/aulas
    "/jng/guia-definitivo-de-entrevista": "/aulas/guia-definitivo-de-entrevista",
    "/jng/prepare-se-para-a-entrevista": "/aulas/prepare-se-para-a-entrevista",
    "/jng/algoritmos-para-entrevistas": "/aulas/algoritmos-para-entrevistas",
    "/jng/definindo-o-tema-do-seu-conteudo": "/aulas/definindo-o-tema-do-seu-conteudo",
    "/jng/por-que-o-linkedin-e-a-melhor-ferramenta": "/aulas/por-que-o-linkedin-e-a-melhor-ferramenta",
    "/jng/o-modo-creator": "/aulas/o-modo-creator",
    "/jng/como-funciona-o-feed-do-linkedin": "/aulas/como-funciona-o-feed-do-linkedin",
    "/jng/como-e-a-audiencia-do-linkedin-em-2024": "/aulas/como-e-a-audiencia-do-linkedin-em-2024",
    "/jng/como-funcionam-os-engajamentos-no-linkedin": "/aulas/como-funcionam-os-engajamentos-no-linkedin",
    "/jng/formatos-de-postagem-no-linkedin": "/aulas/formatos-de-postagem-no-linkedin",
    "/jng/estrategias-de-conteudo": "/aulas/estrategias-de-conteudo",
    "/jng/voce-so-e-bom-quando-outra-pessoa-diz": "/aulas/voce-so-e-bom-quando-outra-pessoa-diz",
    "/jng/big-techs-vs-small-techs-startups": "/aulas/big-techs-vs-small-techs-startups",
    "/jng/recruiters-vs-headhunters": "/aulas/recruiters-vs-headhunters",
    "/jng/recruiters-seu-contato-com-empresas-pequenas": "/aulas/recruiters-seu-contato-com-empresas-pequenas",
    "/jng/estrategias-para-lidar-com-headhunters": "/aulas/estrategias-para-lidar-com-headhunters",
    "/jng/junte-se-a-essas-mentorias-e-comunidades": "/aulas/junte-se-a-essas-mentorias-e-comunidades",
    "/jng/estrategia-venture-capital-investidores": "/aulas/estrategia-venture-capital-investidores",
    "/jng/crie-contato-com-as-empresas-que-contratam-brasileiros": "/aulas/crie-contato-com-as-empresas-que-contratam-brasileiros",
    "/jng/capitulo-para-introvertidos": "/aulas/capitulo-para-introvertidos",
    "/jng/notas-finais-e-puxoes-de-orelha": "/aulas/notas-finais-e-puxoes-de-orelha",
    "/jng/o-pais-do-desemprego": "/aulas/o-pais-do-desemprego",
    "/jng/introducao-a-busca-como-comecar-a-procurar": "/aulas/introducao-a-busca-como-comecar-a-procurar",
    "/jng/palavras-chave-dos-donts": "/aulas/palavras-chave-dos-donts",
    "/jng/hack-1-busca-exata-intro-tecnicas-de-busca": "/aulas/hack-1-busca-exata-intro-tecnicas-de-busca",
    "/jng/hack-2-busca-de-termo-exato-em-outras-plataformas": "/aulas/hack-2-busca-de-termo-exato-em-outras-plataformas",
    "/jng/hack-3-busca-boleana-avancada": "/aulas/hack-3-busca-boleana-avancada",
    "/jng/hack-4-busca-ats": "/aulas/hack-4-busca-ats",
    "/jng/hack-5-busque-vagas-gringas-para-brasileiros": "/aulas/hack-5-busque-vagas-gringas-para-brasileiros",
    "/jng/hack-6-use-o-chatgpt": "/aulas/hack-6-use-o-chatgpt",
    "/jng/hack-7-empresas-que-buscam-latam": "/aulas/hack-7-empresas-que-buscam-latam",
    "/jng/hack-8-fundos-de-investimentos-vc-venture-capital": "/aulas/hack-8-fundos-de-investimentos-vc-venture-capital",
    "/jng/conclusao-de-modulo-viu-vaga-nao-falta-o-que-falta-e-voce": "/aulas/conclusao-de-modulo-viu-vaga-nao-falta-o-que-falta-e-voce",
    "/jng/leapfrog-encontre-empresas-que-contratam-brasileiros": "/aulas/leapfrog-encontre-empresas-que-contratam-brasileiros",
}

def fix_routes(content, file_path):
    """Fix /jng/ routes in content."""
    original_content = content
    new_content = content
    
    # Replace all /jng/ routes with correct routes
    for old_route, new_route in ROUTE_MAP.items():
        # Pattern to match href="/jng/..." or href='/jng/...'
        pattern = rf'(href=["\']){re.escape(old_route)}(["\'])'
        replacement = rf'\1{new_route}\2'
        new_content = re.sub(pattern, replacement, new_content)
    
    return new_content, new_content != original_content

def main():
    """Main function."""
    print("Fixing /jng/ route references...\n")
    
    fixed_count = 0
    
    # Process all .astro files in jng directory
    for astro_file in (SRC_DIR / "jng").rglob("*.astro"):
        try:
            content = astro_file.read_text(encoding='utf-8')
            new_content, changed = fix_routes(content, astro_file)
            
            if changed:
                astro_file.write_text(new_content, encoding='utf-8')
                fixed_count += 1
                print(f"Fixed: {astro_file.relative_to(BASE_DIR)}")
        except Exception as e:
            print(f"Error processing {astro_file}: {e}")
    
    print(f"\nFixed {fixed_count} file(s)")

if __name__ == "__main__":
    main()
