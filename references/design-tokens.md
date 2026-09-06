# V2 Design Token System

The SVG skill now treats visual output as a system, not a collection of effects.
Every asset should derive from these tokens before drawing.

## 1. Color Roles

Never choose colors by decoration. Assign every color a role.

```yaml
surface: background and atmosphere
ink: primary readable text
muted: secondary information
accent: focus and action
material: texture identity
shadow: depth and separation
glow: controlled light energy
```

Rules:
- Maximum 4 chromatic colors per asset.
- One dominant accent, one supporting accent, optional highlight.
- Shadows inherit the palette temperature; avoid default gray shadows.
- Glow exists to explain light, not to decorate empty space.

## 2. Typography Scale

Default hierarchy:

| Token | Size | Use |
|---|---:|---|
| display | 72px | hero statements |
| title | 48px | main headings |
| section | 32px | grouped content |
| heading | 24px | components |
| body | 18px | readable text |
| caption | 13px | metadata |

Line height:
- Display: 1.05–1.15
- Heading: 1.2–1.35
- Body: 1.5–1.7

## 3. Spacing System

Use intentional spacing:

```
4 / 8 / 16 / 24 / 32 / 48 / 64 / 96
```

Avoid arbitrary distances unless required by geometry.

## 4. Material Tokens

Materials must describe physical behavior:

- glass: transparency + reflection + depth
- paper: grain + edge + shadow
- light: atmosphere + direction
- metal: reflection + restraint

Do not mix incompatible material languages.

## 5. Motion Tokens

Animation must explain material or hierarchy.

```yaml
ambient:
  duration: 8-20s
  purpose: atmosphere

material:
  duration: 2-6s
  purpose: physical response

interaction:
  duration: 300-700ms
  purpose: feedback
```

Never add motion without a visual reason.
