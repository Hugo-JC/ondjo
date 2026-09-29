ONDJO — AUTH UI UPDATE

Objetivo: adicionar Login e Cadastro mantendo o visual atual da ONDJO.

Rotas:
#/login
#/cadastro

Cadastro em 4 passos:
1. Perfil: Cliente ou Proprietário
2. Dados pessoais + objetivo específico do perfil
3. Dados da conta
4. Confirmação

Esta alteração é UI/UX e estado local. Não implementa autenticação real.
Nenhuma dependência nova.

Arquivos novos:
src/components/auth/AuthLayout.tsx
src/components/auth/AuthInput.tsx
src/components/auth/RoleCard.tsx
src/pages/LoginPage.tsx
src/pages/RegisterPage.tsx

Arquivos alterados:
src/App.tsx
src/components/Header.tsx
src/components/Sidebar.tsx

Adicione src/index.css.add.txt ao final do index.css atual.
