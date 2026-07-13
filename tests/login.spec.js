import { test, expect } from '@playwright/test';
import { obterCodigo2FA } from '../support/db';
import { LoginPage } from '../pages/LoginPage';
import { DashPage } from '../pages/DashPage';
import { cleanJobs, getJob } from '../support/redis';

test.describe('Testes de login', () =>  {

  test('001 - login com autenticação inválida', async ({ page }) => {
    await page.goto('http://paybank-mf-auth:3000/');
    
    await page.getByRole('textbox', { name: 'Digite seu CPF' }).fill('00000014141');
    await page.getByRole('button', { name: 'Continuar' }).click();

    await page.getByRole('button', { name: '1' }).click();
    await page.getByRole('button', { name: '4' }).click();
    await page.getByRole('button', { name: '7' }).click();
    await page.getByRole('button', { name: '2' }).click();
    await page.getByRole('button', { name: '5' }).click();
    await page.getByRole('button', { name: '8' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();

    await page.getByRole('textbox', { name: '000000' }).fill('123456');
    await page.getByRole('button', { name: 'Verificar' }).click();

    await expect(page.locator('span')).toContainText('Código inválido. Por favor, tente novamente.');
  });

  // melhorarando o código...


  const utilizadores = {
      cpf: '00000014141',
      senha: '147258'
    }


  test('002 - login com autenticação inválida - código otimizado', async ({ page }) => {
  
    await page.goto('http://paybank-mf-auth:3000/');
    
    await page.getByRole('textbox', { name: 'Digite seu CPF' }).fill(utilizadores.cpf);
    await page.getByRole('button', { name: 'Continuar' }).click();

  for (const digito of utilizadores.senha) {
    await page.getByRole('button', { name: digito }).click();
  }
  await page.getByRole('button', { name: 'Continuar' }).click();

    await page.getByRole('textbox', { name: '000000' }).fill('123456');
    await page.getByRole('button', { name: 'Verificar' }).click();

    await expect(page.locator('span')).toContainText('Código inválido. Por favor, tente novamente.');
  });


  // informar código de autenticação válido - integração com a Base de Dados

  test('003 - login com autenticação válida', async ({ page }) => {

    await page.goto('http://paybank-mf-auth:3000/');

    await page.getByRole('textbox', { name: 'Digite seu CPF' }).fill(utilizadores.cpf);
    await page.getByRole('button', { name: 'Continuar' }).click();

    for (const digito of utilizadores.senha) {
      await page.getByRole('button', { name: digito }).click();
    }
    await page.getByRole('button', { name: 'Continuar' }).click();

    // temporário o timeout
    await page.waitForTimeout(3000)
    const code = await obterCodigo2FA(utilizadores.cpf)

    await page.getByRole('textbox', { name: '000000' }).fill(code);
    await page.getByRole('button', { name: 'Verificar' }).click();

    await page.waitForTimeout(2000)

    await expect(page.locator('#account-balance')).toHaveText('R$ 5.000,00')
  });

  // Padrão Page Object - melhoria do código acima no padrão que deve ser, com reaproveitamento de código.

  test('004 - login com autenticação válida - Page Object Pattern', async ({ page }) => {

    const loginPage = new LoginPage(page)
    const dashPage = new DashPage(page)

    await loginPage.acessPage()
    await loginPage.fillCPF(utilizadores.cpf)
    await loginPage.fillPassword(utilizadores.senha)

    // temporário o timeout
    await page.waitForTimeout(3000)
    const code = await obterCodigo2FA(utilizadores.cpf)

    await loginPage.fillCode2FA(code)

    // temporário o timeout
    await page.waitForTimeout(2000)

    expect(await dashPage.checkBalance()).toHaveText('R$ 5.000,00')
  });

  // eliminar os sleeps - melhoria de código

  test('005 - login com autenticação válida - Page Object Pattern', async ({page}) => {
    const loginPage = new LoginPage(page)
    const dashPage = new DashPage(page)

    await loginPage.acessPage()
    await loginPage.fillCPF(utilizadores.cpf)
    await loginPage.fillPassword(utilizadores.senha)

    // agora o código aguarda ATÉ 3s, mas se chegar na página de destino antes o teste já segue.
    await page.getByRole('heading', {name:'Verificação em duas etapas'})
      .waitFor({timeout: 3000})

    const code = await obterCodigo2FA(utilizadores.cpf)

    await loginPage.fillCode2FA(code)

    await expect(await dashPage.checkBalance()).toHaveText('R$ 5.000,00')
  });


  //interação com redis, biblioteca bullmq, melhoria de código. Consome o código do Redis ao inves da BD!

  test('006 - login com autenticação válida - Interação com Redis', async ({page}) => {
    const loginPage = new LoginPage(page)
    const dashPage = new DashPage(page)

    await cleanJobs()

    await loginPage.acessPage()
    await loginPage.fillCPF(utilizadores.cpf)
    await loginPage.fillPassword(utilizadores.senha)

    // agora o código aguarda ATÉ 3s, mas se chegar na página de destino antes o teste já segue.
    await page.getByRole('heading', {name:'Verificação em duas etapas'})
      .waitFor({timeout: 3000})

    const code = await getJob()
    // const code = await obterCodigo2FA(utilizadores.cpf)

    await loginPage.fillCode2FA(code)

    await expect(await dashPage.checkBalance()).toHaveText('R$ 5.000,00')
  });
});