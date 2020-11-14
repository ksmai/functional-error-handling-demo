class Right<E, A> {
  private readonly a: A;

  constructor(a: A) {
      this.a = a;
  }

  isLeft() {
    return false;
  }

  isRight(): this is Right<E, A> {
    return true;
  }

  static of<E, A>(a: A): Either<E, A> {
      return new Right(a);
  }

  map<B>(f: (a: A) => B): Either<E, B> {
      return new Right<E, B>(f(this.a));
  }

  chain<B>(f: (a: A) => Either<E, B>): Either<E, B> {
      return f(this.a);
  }

  get value() {
    return this.a;
  }
}

class Left<E, A> {
  private readonly e: E;

  constructor(e: E) {
      this.e = e;
  }

  isLeft(): this is Left<E, A> {
    return true;
  }

  isRight() {
    return false;
  }

  static of<E, A>(e: E): Either<E, A> {
      return new Left(e);
  }

  map<B>(f: (a: A) => B): Either<E, B> {
      return this as any as Left<E, B>;
  }

  chain<B>(f: (a: A) => Either<E, B>): Either<E, B> {
      return this as any as Left<E, B>;
  }

  get value() {
    return this.e;
  }
}

type Either<E, A> = Left<E, A> | Right<E, A>;
function left<E, A>(e: E): Either<E, A> { return Left.of<E, A>(e); }
function right<E, A>(x: A) { return Right.of<E, A>(x); }

class UserName {
  private name: string;

  private constructor(name: string) {
    this.name = name;
  }

  static parse(name: string): Either<string, UserName> {
    if (name.length < 10) {
      return Left.of("UserName is too short!");
    }
    return Right.of(new UserName(name));
  }
}

class UserEmail {
  private email: string;

  private constructor(email: string) {
    this.email = email;
  }

  static parse(email: string): Either<string, UserEmail> {
    if (!/[^@]+@[^@]+/.test(email)) {
      return Left.of("Invalid UserEmail!");
    }
    return Right.of(new UserEmail(email));
  }
}
class UserPassword {
  private password: string;

  private constructor(password: string) {
    this.password = password;
  }

  static parse(password: string): Either<string, UserPassword> {
    if (!password.includes('!')) {
      return Left.of("UserPassword does not contain '!' !");
    }
    return Right.of(new UserPassword(password));
  }
}
class User {
  private userName: UserName;
  private userEmail: UserEmail;
  private userPassword: UserPassword;

  constructor(userName: UserName, userEmail: UserEmail, userPassword: UserPassword) {
    this.userName = userName;
    this.userEmail = userEmail;
    this.userPassword = userPassword;
  }
}

type E = string;

function createUser1(name: string, email: string, password: string): Either<E, User> {
  const userName: Either<E, UserName> = UserName.parse(name);
  if (userName.isLeft()) {
    return left(userName.value);
  }

  const userEmail: Either<E, UserEmail> = UserEmail.parse(email);
  if (userEmail.isLeft()) {
    return left(userEmail.value);
  }

  const userPassword: Either<E, UserPassword> = UserPassword.parse(password);
  if (userPassword.isLeft()) {
    return left(userPassword.value);
  }

  return Right.of(new User(userName.value, userEmail.value, userPassword.value));
}

function createUser2(name: string, email: string, password: string): Either<E, Either<E, Either<E, User>>> {
  const userName: Either<E, UserName> = UserName.parse(name);

  const userEmail: Either<E, Either<E, UserEmail>> = 
    userName.map(() => UserEmail.parse(email));

  const userPassword: Either<E, Either<E, Either<E, UserPassword>>> =
    userEmail.map((inner) => inner.map(() => UserPassword.parse(password)));

  return userPassword.map(x => x.map(
    y => y.map(
      () => new User(
        userName.value as UserName,
        (userEmail.value as Either<E, UserEmail>).value as UserEmail,
        ((userPassword.value as Either<E, Either<E, UserPassword>>).value as Either<E, UserPassword>).value as UserPassword
      )
    )
  ));
}

function createUser3(name: string, email: string, password: string): Either<E, User> {
  const userName: Either<E, UserName> = UserName.parse(name);
  const userEmail: Either<E, UserEmail> = userName.chain(() => UserEmail.parse(email));
  const userPassword: Either<E, UserPassword> = userEmail.chain(() => UserPassword.parse(password));
  return userPassword.map(() => new User(
    userName.value as UserName,
    userEmail.value as UserEmail,
    userPassword.value as UserPassword,
  ));
}

function createUser4(name: string, email: string, password: string): Either<E, User> {
  return UserName.parse(name).chain((userName: UserName) =>
      UserEmail.parse(email).chain((userEmail: UserEmail) =>
        UserPassword.parse(password).map((userPassword: UserPassword) =>
          new User(userName, userEmail, userPassword))));
}

console.log(createUser1("A very long user name", "foo@bar.com", "!!pass!!!"));
console.log(createUser1("too short", "foo@bar.com", "!!pass!!!"));
console.log(createUser2("A very long user name", "foo@bar.com", "!!pass!!!"));
console.log(createUser2("too short", "foo@bar.com", "!!pass!!!"));
console.log(createUser3("A very long user name", "foo@bar.com", "!!pass!!!"));
console.log(createUser3("too short", "foo@bar.com", "!!pass!!!"));
console.log(createUser4("A very long user name", "foo@bar.com", "!!pass!!!"));
console.log(createUser4("too short", "foo@bar.com", "!!pass!!!"));
