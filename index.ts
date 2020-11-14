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

  map<U>(f: (a: A) => U): Either<E, U> {
      return new Right<E, U>(f(this.a));
  }

  chain<U>(f: (a: A) => U) {
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

  map<U>(f: (a: A) => U): Either<E, U> {
      return Left.of<E, U>(this.e);
  }

  chain<U>(f: (e: E) => U) {
      return this;
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

/*
function createUser2(name: string, email: string, password: string): Either<E, Either<E, Either<E, User>>> {
  const userName: Either<E, UserName> = UserName.parse(name);

  const userEmail: Either<E, Either<E, UserEmail>> = 
    userName.map(() => UserEmail.parse(email));

  const userPassword: Either<E, Either<E, Either<E, UserPassword>>> =
    userEmail.map((inner) => inner.map(() => UserPassword.parse(password)));

  return userPassword.map(x => x.map(y => y.map(() => new User(userName.value, userEmail.value.value, userPassword.value.value.value))));
}
*/

console.log(createUser1("name name name", "email@x", "pa!ss"));
