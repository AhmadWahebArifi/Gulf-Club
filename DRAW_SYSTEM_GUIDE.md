# Draw System Location & Functionality

## 🎯 Draw System Location

**The Draw System is ONLY in the Admin Panel - not in the User Dashboard**

### Why Admin Panel Only?
- **Fairness**: Users shouldn't be able to run their own draws
- **Control**: Admins manage the draw process and timing
- **Verification**: Admins verify scores before running draws
- **Prize Management**: Admins assign and track prizes

### How to Access Draw System:
1. **Login as Admin** (email in NEXT_PUBLIC_ADMIN_EMAILS)
2. **Navigate to `/admin`** (via navigation bar)
3. **Run Monthly Draw** button in admin panel

## 🏆 Draw System Features

### Admin Panel Functions:
- **Monthly Draw Execution**: Weighted random selection based on Stableford points
- **Winner Selection**: GOLD, SILVER, BRONZE prizes
- **Draw History**: View all past draw events
- **Winner Management**: Track and verify winners

### User Experience:
- **Users earn entries** based on their scores (1 entry per point)
- **Users can't see draw controls** - only results
- **Winners are announced** by admins
- **Prize distribution** managed by admins

## 📊 Draw Algorithm

### Weighted Random Selection:
1. **Calculate entries**: Each Stableford point = 1 draw entry
2. **User weighting**: More points = higher chance to win
3. **Monthly period**: Only scores from current month count
4. **Multiple winners**: Select GOLD, SILVER, BRONZE winners

### Example:
- User A: 40 points = 40 entries
- User B: 25 points = 25 entries  
- User C: 15 points = 15 entries
- Total: 80 entries → Weighted random selection

## 🔧 Admin Draw Controls

### In Admin Panel:
- **"Run Monthly Draw" button**
- **Draw event creation** (stores period, timestamp)
- **Winner selection** (stores user_id, prize)
- **Results display** (shows winners with prizes)

### Database Tables:
- `draw_events`: When draw was run, period covered
- `draw_winners`: Who won, what prize, draw reference

## 🎮 User vs Admin Access

### User Dashboard:
- ✅ Add scores
- ✅ Select charities
- ✅ View subscription status
- ❌ No draw controls

### Admin Panel:
- ✅ All user functions
- ✅ Run draws
- ✅ Verify scores
- ✅ Manage winners
- ✅ View system diagnostics

This separation ensures **fair draw execution** while giving users **full dashboard functionality** for their golf tracking and charity support.
