class Right<T> {
  private readonly x: T;

  constructor(x: T) {
      this.x = x;
  }

  isLeft() {
    return false;
  }

  isRight(): this is Right<T> {
    return true;
  }

  static of<T>(x: T) {
      return new Right(x);
  }

  map<U>(f: (x: T) => U) {
      return new Right<U>(f(this.x));
  }

  chain<U>(f: (x: T) => U) {
      return f(this.x);
  }

  get value() {
    return this.x;
  }
}

class Left<E> {
  private readonly e: E;

  constructor(e: E) {
      this.e = e;
  }

  isLeft(): this is Left<E> {
    return true;
  }

  isRight() {
    return false;
  }

  static of<E>(e: E) {
      return new Left(e);
  }

  map<U>(f: (e: E) => U) {
      return this;
  }

  chain<U>(f: (e: E) => U) {
      return this;
  }

  get value() {
    return this.e;
  }
}

type Either<E, A> = Left<E> | Right<A>;
function left<E>(e: E) { return Left.of(e); }
function right<T>(x: T) { return Right.of(x); }

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

console.log(createUser1("ababcabcccc", "email@example.com", "pass!"));
