import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Banner } from '../models/banner.model';

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private apiUrl = 'http://localhost:8080/api/v1/banners/active';

  constructor(private http: HttpClient) { }

  getActiveBanners(): Observable<Banner[]> {
    return this.http.get<Banner[]>(this.apiUrl);
  }
}