import { Injectable } from '@angular/core';
import { AuthService, localStorageUserField } from './auth.service';
import { User } from '@models/user';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { apiUrl, loginRouter } from '@app/app.constants';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class JwtAuthService implements AuthService {

  private currentUser$: BehaviorSubject<User>;

  private tokenValid: boolean

  constructor(private httpClient: HttpClient, private router: Router) {
    const user = JSON.parse(localStorage.getItem(localStorageUserField))
    this.currentUser$ = new BehaviorSubject<User>(user)
  }

  get user(): User {
    return this.currentUser$.getValue()
  }

  get isUserLoggedIn(): boolean {
    return !!this.user?.token;
  }

  get isUserLoggedIn$(): Observable<boolean> {
    if (!this.user?.token) {
      return of(false)
    }

    if (this.tokenValid) {
      return of(true)
    }

    return this.isTokenValid()
      .pipe(
        tap(value => this.tokenValid = value)
      )
  }

  login(email: string, password: string): Observable<User> {
    return this.saveUser(
      this.httpClient.post<User>(`${apiUrl}/login`, {email, password})
    )
  }

  logout(): Observable<void> {
    return this.httpClient.get<void>(`${apiUrl}/logout`)
      .pipe(
        tap(() => {
          this.resetCurrentUser()
          this.router.navigateByUrl(loginRouter)
        })
      )
  }

  register(user: User): Observable<void> {
    return this.httpClient.post<void>(`${apiUrl}/register`, user)
  }

  recoverPassword(email: string): Observable<void> {
    return this.httpClient.post<void>(`${apiUrl}/recover-password`, {email})
  }

  reset(password: string, token: string): Observable<void> {
    return this.httpClient.post<void>(`${apiUrl}/reset-password`, {password, token})
  }

  refreshToken(email, token): Observable<User> {
    if (!token) {
      return throwError('User is not logged in')
    }
    return this.saveUser(
      this.httpClient.post<User>(`${apiUrl}/update_refresh_access_token`, {email, token})
    ).pipe(
      catchError(error => {
        localStorage.removeItem(localStorageUserField)
        this.currentUser$.next(null)
        throw error
      })
    )
  }

  private saveUser(request$: Observable<User>): Observable<User> {
    return request$
      .pipe(
        tap(user => {
          if (user) {
            localStorage.setItem(localStorageUserField, JSON.stringify(user))
            this.currentUser$.next(user)
          }
        })
      )
  }

  private isTokenValid(): Observable<boolean> {
    return this.httpClient.get<boolean>(`${apiUrl}/is_token_valid`)
      .pipe(
        catchError(() => of(false)),
        tap(value => !value && this.resetCurrentUser())
      )
  }

  private resetCurrentUser() {
    localStorage.removeItem(localStorageUserField)
    this.currentUser$.next(null)
    this.tokenValid = false
  }
}
