const { UserService } = require('../src/userService');

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  describe('createUser', () => {
    test('deve retornar o novo usuário com um id gerado', () => {
      // Arrange
      const nome = 'Fulano de Tal';
      const email = 'fulano@teste.com';
      const idade = 25;

      // Act
      const usuario = userService.createUser(nome, email, idade);

      // Assert
      expect(usuario.id).toEqual(expect.any(String));
    });

    test('deve criar o usuário com status "ativo" por padrão', () => {
      // Arrange
      const idade = 25;

      // Act
      const usuario = userService.createUser('Fulano', 'fulano@teste.com', idade);

      // Assert
      expect(usuario.status).toBe('ativo');
    });

    test('deve criar o usuário como não administrador por padrão', () => {
      // Arrange
      const idade = 25;

      // Act
      const usuario = userService.createUser('Fulano', 'fulano@teste.com', idade);

      // Assert
      expect(usuario.isAdmin).toBe(false);
    });

    test('deve lançar erro ao criar usuário menor de idade', () => {
      // Arrange
      const idadeMenor = 17;

      // Act
      const criarMenor = () => userService.createUser('Menor', 'menor@email.com', idadeMenor);

      // Assert
      expect(criarMenor).toThrow('O usuário deve ser maior de idade.');
    });

    test('deve lançar erro quando um campo obrigatório não é informado', () => {
      // Arrange
      const emailAusente = undefined;

      // Act
      const criarSemEmail = () => userService.createUser('Sem Email', emailAusente, 30);

      // Assert
      expect(criarSemEmail).toThrow('Nome, email e idade são obrigatórios.');
    });
  });

  describe('getUserById', () => {
    test('deve retornar os dados do usuário previamente criado', () => {
      // Arrange
      const criado = userService.createUser('Fulano de Tal', 'fulano@teste.com', 25);

      // Act
      const buscado = userService.getUserById(criado.id);

      // Assert
      expect(buscado).toMatchObject({
        nome: 'Fulano de Tal',
        email: 'fulano@teste.com',
        idade: 25,
      });
    });

    test('deve retornar null para um id inexistente', () => {
      // Arrange
      const idInexistente = 'id-que-nao-existe';

      // Act
      const resultado = userService.getUserById(idInexistente);

      // Assert
      expect(resultado).toBeNull();
    });
  });

  describe('deactivateUser', () => {
    test('deve retornar true ao desativar um usuário comum', () => {
      // Arrange
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      const resultado = userService.deactivateUser(usuarioComum.id);

      // Assert
      expect(resultado).toBe(true);
    });

    test('deve alterar o status de um usuário comum para "inativo"', () => {
      // Arrange
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      userService.deactivateUser(usuarioComum.id);

      // Assert
      expect(userService.getUserById(usuarioComum.id).status).toBe('inativo');
    });

    test('deve retornar false ao tentar desativar um administrador', () => {
      // Arrange
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Act
      const resultado = userService.deactivateUser(usuarioAdmin.id);

      // Assert
      expect(resultado).toBe(false);
    });

    test('deve manter o administrador com status "ativo" após tentativa de desativação', () => {
      // Arrange
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Act
      userService.deactivateUser(usuarioAdmin.id);

      // Assert
      expect(userService.getUserById(usuarioAdmin.id).status).toBe('ativo');
    });

    test('deve retornar false ao tentar desativar um usuário inexistente', () => {
      // Arrange
      const idInexistente = 'id-que-nao-existe';

      // Act
      const resultado = userService.deactivateUser(idInexistente);

      // Assert
      expect(resultado).toBe(false);
    });
  });

  describe('generateUserReport', () => {
    test('deve incluir um cabeçalho no relatório', () => {
      // Arrange
      userService.createUser('Alice', 'alice@email.com', 28);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toMatch(/Relatório de Usuários/);
    });

    test('deve incluir o id, o nome e o status de cada usuário cadastrado', () => {
      // Arrange
      const alice = userService.createUser('Alice', 'alice@email.com', 28);
      const bob = userService.createUser('Bob', 'bob@email.com', 32);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain(alice.id);
      expect(relatorio).toContain('Alice');
      expect(relatorio).toContain(bob.id);
      expect(relatorio).toContain('Bob');
      expect(relatorio).toContain('ativo');
    });

    test('deve informar que não há usuários quando o cadastro está vazio', () => {
      // Arrange
      // (o beforeEach já garante um banco vazio)

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toMatch(/Nenhum usuário cadastrado/);
    });
  });
});
