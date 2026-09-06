# Design Memory System

The SVG engine should accumulate design experience instead of repeating the same patterns.

Memory stores three categories:

- successful compositions
- rejected patterns
- style history

The purpose is not to store raw SVG output, but to preserve design decisions.

## Memory Flow

```
Generated SVG
      ↓
Semantic Analysis
      ↓
Review Result
      ↓
Memory Update
      ↓
Future Generation
```

The system should remember:

- what worked
- what failed
- what combinations should be avoided
