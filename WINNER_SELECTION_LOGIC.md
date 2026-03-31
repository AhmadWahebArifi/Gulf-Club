# 🏆 Winner Selection Logic Explained

## 🎯 How Winners Are Decided

### **Admin Runs Draw → Users Win Prizes**

**The Process:**
1. **Admin** clicks "Run Monthly Draw" in Admin Panel
2. **System** calculates entries based on user scores
3. **Winners** are randomly selected with weighted probability
4. **Users** are notified of their winning status

---

## 🎲 Weighted Random Selection Algorithm

### **Step 1: Calculate User Entries**
```
User A: 40 Stableford points = 40 draw entries
User B: 25 Stableford points = 25 draw entries  
User C: 15 Stableford points = 15 draw entries
User D: 30 Stableford points = 30 draw entries
```

### **Step 2: Create Weighted Pool**
```
Total entries: 110 (40 + 25 + 15 + 30)
User A: 36.4% chance (40/110)
User B: 22.7% chance (25/110)
User C: 13.6% chance (15/110)
User D: 27.3% chance (30/110)
```

### **Step 3: Random Selection Without Replacement**
1. **Pick GOLD winner** from all entries
2. **Remove GOLD winner** from pool
3. **Pick SILVER winner** from remaining entries
4. **Remove SILVER winner** from pool
5. **Pick BRONZE winner** from remaining entries

---

## 📊 Example Draw Execution

### **Initial Pool:**
```
Users: [A(40), B(25), C(15), D(30)]
Entries: [A×40, B×25, C×15, D×30]
```

### **GOLD Winner Selection:**
- Random number 1-110
- Let's say it lands on entry #67 → **User D wins GOLD**
- Remove User D from pool

### **SILVER Winner Selection:**
- Remaining pool: [A×40, B×25, C×15] = 80 entries
- Random number 1-80
- Let's say it lands on entry #23 → **User A wins SILVER**
- Remove User A from pool

### **BRONZE Winner Selection:**
- Remaining pool: [B×25, C×15] = 40 entries
- Random number 1-40
- Let's say it lands on entry #35 → **User B wins BRONZE**

### **Final Results:**
```
🥇 GOLD: User D (30 points)
🥈 SILVER: User A (40 points)  
🥉 BRONZE: User B (25 points)
```

---

## 🎮 Why This System is Fair

### **1. Merit-Based**
- **More points = More entries = Higher chance**
- Rewards active golfers who play well

### **2. Random Within Merit**
- **Still random** - high points don't guarantee winning
- **Everyone has a chance** if they have any points

### **3. Multiple Winners**
- **3 prizes per month** (GOLD, SILVER, BRONZE)
- **More chances to win** for more users

### **4. No Duplicate Winners**
- **One prize per user per month**
- **Fair distribution** among participants

---

## 🔧 Technical Implementation

### **Weighted Random Function:**
```javascript
function weightedPickOne(items) {
  // items = [{user_id: "A", weight: 40}, {user_id: "B", weight: 25}]
  const total = items.reduce((sum, it) => sum + it.weight, 0);
  let r = Math.random() * total;
  
  for (const it of items) {
    r -= it.weight;
    if (r <= 0) return it.user_id;
  }
  return items[0].user_id;
}
```

### **Draw Process:**
```javascript
// 1. Get all eligible users with points
const pool = getUsersWithPoints();

// 2. Pick GOLD winner
const goldWinner = weightedPickOne(pool);
removeUserFromPool(goldWinner);

// 3. Pick SILVER winner  
const silverWinner = weightedPickOne(pool);
removeUserFromPool(silverWinner);

// 4. Pick BRONZE winner
const bronzeWinner = weightedPickOne(pool);
removeUserFromPool(bronzeWinner);
```

---

## 🏅 Prize Distribution

### **Monthly Prizes:**
- **🥇 GOLD**: Top prize (highest prestige)
- **🥈 SILVER**: Second prize  
- **🥉 BRONZE**: Third prize

### **Winner Notification:**
- **Admin sees results** immediately
- **Winners stored** in database with prize level
- **Draw history** preserved for transparency

---

## 🎯 Key Points

1. **Admin controls** when draws happen
2. **Users earn entries** through golf performance
3. **Random selection** weighted by points
4. **Fair system** - more activity = higher chance
5. **Multiple winners** each month
6. **Transparent process** with full audit trail

**The system rewards active golfers while maintaining excitement through random selection!**
