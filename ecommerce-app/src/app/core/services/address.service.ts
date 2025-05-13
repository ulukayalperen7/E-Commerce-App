import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddressResponse, AddressRequest } from '../models/address.model';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = 'http://localhost:8080/api/v1/addresses';

  constructor(private http: HttpClient) {}

  getMyAddresses(): Observable<AddressResponse[]> {
    return this.http.get<AddressResponse[]>(this.apiUrl);
  }

  createAddress(addressData: AddressRequest): Observable<AddressResponse> {
    return this.http.post<AddressResponse>(this.apiUrl, addressData);
  }

  getAddressById(addressId: number): Observable<AddressResponse> {
    return this.http.get<AddressResponse>(`${this.apiUrl}/${addressId}`);
  }

  updateAddress(addressId: number, addressData: AddressRequest): Observable<AddressResponse> {
    return this.http.put<AddressResponse>(`${this.apiUrl}/${addressId}`, addressData);
  }

  deleteAddress(addressId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${addressId}`);
  }
}
