import os
import json
import asyncio
from aiomysql import create_pool
from redis.asyncio import Redis

class Maria:
    def __init__(self, dsn):
        self.dsn = dsn

    async def fetch(self, query):
        results = []
        try:
            async with create_pool(**self.dsn) as pool:
                async with pool.acquire() as conn:
                    async with conn.cursor() as cur:
                        await cur.execute(query)
                        results = await cur.fetchall()
        except Exception as e:
            print(f"Error fetching data: {e}")
        return results

class Messenger:
    mariadmin = Maria({
        'host': os.getenv('MARIADMIN_HOST'),
        'user': os.getenv('MARIADMIN_USER'),
        'password': os.getenv('MARIADMIN_PASSWORD'),
        'db': os.getenv('MARIADMIN_DB')
    })
    mariapublic = Maria({
        'host': os.getenv('MARIA_HOST'),
        'user': os.getenv('MARIA_USER'),
        'password': os.getenv('MARIA_PASSWORD'),
        'db': os.getenv('MARIA_DB')
    })
    redis = Redis.from_url(os.getenv('REDIS_URL'))

    @staticmethod
    async def construct_default_message(results):
        text = ''
        try:
            if 'statement' in results:
                text = await Messenger.build_statement(results['statement'], results.get('domappend', ''))
            else:
                text = results.get('text', '')

            return {
                "system": results.get('system', 'vivalibrocom'),
                "page": '',
                "execute": results.get('execute', ''),
                "cast": results.get('cast', ''),
                "type": results.get('type', ''),
                "text": text,
                "class": results.get('domappend', '')
            }
        except Exception as e:
            print(f"Error constructing default message: {e}")
            return None

    @staticmethod
    async def build_statement(statement, domappend):
        try:
            if not statement or not domappend:
                print(f"Skipping invalid statement or domappend: {statement}")
                return ''

            statement_results = await Messenger.mariapublic.fetch(statement)
            keys = domappend.split(',')
            results = {}

            for key in keys:
                found_row = next((row for row in statement_results if row.get(key) is not None), None)
                results[key] = found_row.get(key) if found_row else None

            return results
        except Exception as e:
            print(f"Error building statement: {e}")
            return ''

    @staticmethod
    async def publish_message(res):
        try:
            default_message = await Messenger.construct_default_message(res)
            if default_message:
                await Messenger.redis.publish(os.getenv('REDIS_CHANNEL'), json.dumps(default_message))
        except Exception as e:
            print(f"Error publishing message: {e}")
