# 🔑 Token Management Guide

## Si të përdoret Token Management në Frontend

### 1. Vendosja e Token-it nga Swagger

1. **Hap Swagger UI**: Shko te `https://localhost:7210/swagger/index.html`
2. **Bëj Login**: Përdor `admin` si username dhe `admin` si password
3. **Kopjo Token-in**: Pas login-it, kopjo token-in që merr
4. **Vendos në Frontend**: 
   - Shko te API Test Panel në frontend
   - Në seksionin "Token Management", vendos token-in në input field
   - Kliko "Vendos Token"

### 2. Verifikimi i Token-it

- **Status**: Do të shohësh "✅ Token i disponueshëm" nëse token-i është vendosur
- **Token Preview**: Do të shohësh një preview të token-it (50 karakteret e para)
- **Console Logs**: Në browser console do të shohësh mesazhet e token-it

### 3. Testimi i API-t

1. **Vendos Token-in**: Sigurohu që token-i është vendosur
2. **Kliko "Testo API-t"**: Kjo do të testojë të gjitha API endpoints
3. **Kontrollo Rezultatet**: Do të shohësh nëse API-t po funksionojnë

### 4. Troubleshooting

#### Problemi: "No token available for request"
**Zgjidhja**: 
- Sigurohu që ke vendosur token-in në Token Management section
- Kontrollo nëse token-i është i vlefshëm (nuk ka skaduar)

#### Problemi: "401 Unauthorized"
**Zgjidhja**:
- Token-i mund të ketë skaduar, vendos një token të ri
- Kontrollo nëse token-i është kopjuar siç duhet

#### Problemi: "Failed to fetch"
**Zgjidhja**:
- Kontrollo nëse backend-i po funksionon në `http://localhost:7210`
- Kontrollo nëse ka probleme me CORS

### 5. Token Storage

- **localStorage**: Token-i ruhet në localStorage të browser-it
- **Automatic**: Token-i përdoret automatikisht në të gjitha API calls
- **Persistence**: Token-i mbetet edhe pas refresh të faqes

### 6. API Calls me Token

Të gjitha API calls përdorin automatikisht token-in:
```typescript
// Token-i përdoret automatikisht
const response = await productService.getAllProducts();
const response = await roomService.getRooms();
const response = await paymentService.getAllPayments();
```

### 7. Logout

- **Clear Token**: Kliko "Fshi Token" për të fshirë token-in
- **Automatic**: Token-i fshihet automatikisht kur bëhet logout

### 8. Console Logs

Kur bëhen API calls, do të shohësh në console:
- `🔑 Using token for request: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- `✅ Token set in localStorage`
- `⚠️ No token available for request` (nëse nuk ka token)

### 9. Test Results

Pas testimit, do të shohësh:
- **Sukses**: Numri i API calls që funksionojnë
- **Dështim**: Numri i API calls që dështojnë
- **Detaje**: Mund të shohësh detajet e çdo testi

### 10. Best Practices

1. **Vendos Token-in**: Gjithmonë vendos token-in para se të testosh API-t
2. **Kontrollo Status**: Sigurohu që token-i është i disponueshëm
3. **Refresh Token**: Nëse token-i skadon, vendos një token të ri
4. **Clear Token**: Fshi token-in kur të mbarosh testimin

---

## 🚀 Quick Start

1. **Backend**: Sigurohu që backend-i po funksionon në `http://localhost:7210`
2. **Swagger**: Bëj login në Swagger me `admin/admin`
3. **Kopjo Token**: Kopjo token-in nga Swagger
4. **Frontend**: Vendos token-in në API Test Panel
5. **Test**: Kliko "Testo API-t" për të testuar të gjitha endpoints

---

**Shënim**: Ky guide është për development/testing. Në production, token management duhet të bëhet përmes login form në aplikacion.
