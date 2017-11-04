"""SQLAlchemy Metadata and Session object"""

__all__ = ['engine', 'meta', 'Session']

# SQLAlchemy database engine.  Updated by model.init_model().
engine = None

# SQLAlchemy session manager.  Updated by model.init_model().
Session = None

# Global metadata. If you have multiple databases with overlapping table 
# names, you'll need a metadata for each database.
meta = None

