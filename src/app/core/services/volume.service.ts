import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category } from 'src/app/shared/models/category.model';

import { map, tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { Volume } from 'src/app/shared/models/volume.model';

@Injectable({
  providedIn: 'root'
})
export class VolumeService {

  private selectedCategory: Subject<Category>;

  constructor(private http: HttpClient) {
    this.selectedCategory = new Subject();
  }

  public getCategory(): Observable<Category> {
    return new Observable((observer) => {
      this.http.get('/assets/api/categories.json')
        .pipe(
          map((data) => {
            return data as Category;
          }),
          tap((category) => {
            observer.next(category);
            observer.complete();
          })
        )
        .subscribe();
    });
  }

  public getVolumes(categoryId: number): Observable<Volume[]> {
    return new Observable((observer) => {
      this.http.get(`/assets/api/volumes-${categoryId}.json`)
        .pipe(
          map((data) => {
            return data as Volume[];
          }),
          tap((volumes) => {
            observer.next(volumes);
            observer.complete();
          })
        )
        .subscribe();
    });
  }

  public setSelectedCategory(category: Category) {
    this.selectedCategory.next(category);
  }

  public getSelectedCategory(): Observable<Category> {
    return this.selectedCategory.asObservable();
  }
}
